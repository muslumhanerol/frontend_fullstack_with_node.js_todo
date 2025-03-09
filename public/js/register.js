$(document).ready(function () {
    // Field
    let isUpdating = false;
    let updateId = null;
    //const maxCharacters = 2000; // Blog Content Max Characters

    /////////////////////////////////////////////////////////////////////////////////
    // FUNCTIONS
    // ERROR
    // Hata mesajlarını Temizleme Fonksiyonu
    const clearErrors = () => {
        $(".error-message, .valid-message").remove();
    };

    // Hata Mesajlarını Gösterme Fonksiyonu
    const showError = (element, message) => {
        $(element).next(".error-message, .valid-message").remove();
        $(element).after(
            `<small class="text-warning error-message">${message}</small>`
        );
    };

    //Hata mesajlarında Ekleme Fonksiyonu
    const showValid = (element, message) => {
        $(element).next(".error-message, .valid-message").remove();
        $(element).after(
            `<small class="text-success valid-message">${message}</small>`
        );
    };

    /////////////////////////////////////////////////////////////////////////////////
    // Content Length Control
    // Blog içerik harf sınırı kontrolü eden fonksiyon
    // const updateCharCount = () => {
    //     const content = $("#content").val(); // Blog Formunda ki Content(İçerik) alanını al
    //     const charCount = content.length; // Content(İçerik) alanındaki karakter sayısını al
    //     const remaingContentChars = maxCharacters - charCount; //Kalan harf sayısı göster
    //     $("#char-count").text(`Kalan Harf sayısınız: ${remaingContentChars}`); // Kalan harf sayısını labelde göster

    //     // Kalan Harf sayısı 0'dan küçükse,Karakter sınırını aştınız
    //     if (remaingContentChars < 0) {
    //         $("#char-count").removeClass("text-success").addClass("text-danger");
    //         showError(
    //             "#content",
    //             "Karakter sınırını aştınız. En fazla 2000 karakter girebilirsiniz."
    //         );
    //     } else {
    //         $("#char-count").removeClass("text-danger").addClass("text-success");
    //         $(".error-message").remove();
    //     }
    // };

    /////////////////////////////////////////////////////////////////////////////////
    // VALIDATION
    // Blog Register Form Kontrol Doğrulama(Validation)
    const validateForm = () => {
        clearErrors(); // Hata mesajlarını temizle
        let isValid = true; // Form doğrulama kontrolü
        const username = $("#username").val().trim(); // Blog Formunda ki username(İçerik) alanını al
        const password = $("#password").val().trim(); // Blog Formunda ki password(İçerik) alanını al
        const email = $("#email").val().trim(); // Blog Formunda ki email alanını al

        // USERNAME
        if (username === "") {
            showError("#username", "Başlık alanı boş bırakılamaz.");
            isValid = false;
        } else {
            showValid("#username", "Başlık alanı geçerli.");
        }

        // PASSWORD
        if (password === "") {
            showError("#password", "İçerik alanı boş bırakılamaz.");
            isValid = false;
        } else {
            showValid("#password", "İçerik alanı geçerli.");
        }

        // EMAIL
        if (email === "") {
            showError("#email", "Yazar alanı boş bırakılamaz.");
            isValid = false;
        } else {
            showValid("#email", "Yazar alanı geçerli.");
        }
    };


    /////////////////////////////////////////////////////////////////////////////////
    // Kullanıcı İnput değerine veri girdiğinde hatalar yoksa hata mesajını göstermesin
    $("#username, #password, #email").on("input", function () {
        //clearErrors();
        const inputField = $(this);
        const inputFieldValue = inputField.val().trim();
        if (inputFieldValue === "") {
            showError("#username, #password, #email", "Bu alanı boş bırakılamaz.");
        } else {
            showValid(inputField, "Geçerli");
        }
    });

    // Formu içeriklerini Temizleme(Sıfırlama)
    const resetForm = () => {
        $("#blog-register-form")[0].reset();
        isUpdating = false;
        updateId = null;
        //
        clearErrors();
        updateCharCount();
    };

    /////////////////////////////////////////////////////////////////////////////////
    // Hata Yönetimi Fonksiyonu
    const handleError = (xhr, status, error) => {
        //console.error("İşlem başarısız:",error);
        console.error(`İşlem başarısız: ${error}`);
        alert(
            "Beklenmeyen bir hata meydana gelmiştir, Lütfen sonra tekrar deneyiniz."
        );
    };

    /////////////////////////////////////////////////////////////////////////////////
    // CRUD
    // Blog Ekleme/Update
    $("#blog-register-form").on("submit", function (event) {
        // Browser sen dur ben biliyorum ne yapacağımı
        event.preventDefault();
        // Form Doğrulama
        if (!validateForm()) {
            return;
        }

        // Data
        const blogRegisterData = {
            header: $("#username").val(),
            content: $("#password").val(),
            author: $("#email"),
            _csrf: $("input[name='_csrf']").val(),
        };

        // Update
        if (isUpdating && updateId) {
            $.ajax({
                url: `/register/api/${updateId}`,
                method: "PUT",
                data: blogRegisterData,
                success: function (data) {
                    console.log("Güncelleme işlemi başarılı", data);
                    fetchBlogList();
                    resetForm();
                },
                error: handleError,
            });
        } else {
            // Create
            $.ajax({
                url: "/register/api/",
                method: "POST",
                data: blogRegisterData,
                success: function (data) {
                    console.log("Register Ekleme işlemi başarılı", data);
                    fetchBlogList();
                    resetForm();
                },
                error: handleError,
            });
        } //end else
    }); //end Register Ekleme

    // Html tablosundaki ("#blog-table tbody") satırı Düzenle butonuna tıkladığımızda
    // Formu doldursun
    $("#blog-register-table tbody").on("click", ".edit-btn", function () {
        const row = $(this).closest("tr");
        const id = row.data("id");
        $("#username").val(row.find("td:eq(1)").text());
        $("#password").val(row.find("td:eq(2)").text());
        $("#email").val(row.find("td:eq(3)").text());

        isUpdating = true;
        // 1.YOL
        updateId = id;
        // 2.YOL (Local Storage)
        $("#submit-btn").text("Güncelle");
    });

    // Blog Register List
    const fetchBlogList = () => {
        $.ajax({
            url: "/register/api/",
            method: "GET",
            success: function (data) {
                const $tbody = $("#blog-register-table tbody").empty();
                data.forEach((item) => {
                    $tbody.append(`
            <tr data-id="${item._id}">
              <td>${item._id}</td>
              <td>${item.username}</td>
              <td>${item.password}</td>
              <td>${item.email}</td>              
              <td>${item.dateInformation}</td>
              <td>
                <button class="btn btn-warning btn-sm edit-btn" data-id="${blog._id}">Düzenle</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${blog._id}">Sil</button>
              </td>
            </tr>
          `); //end append
                }); // end forEach
            },
            error: handleError,
        });
    }; // end fetchBlogList

    // Blog Bulma

    // Blog Silme
    $("#blog-register-table tbody").on("click", ".delete-btn", function () {
        const deleteId = $(this).closest("tr").data("id");
        if (!confirm(`${deleteId} numaralı ID Silmek istediğinizden emin misiniz?`))
            return;

        $.ajax({
            url: `/register/api/${deleteId}`,
            method: "DELETE",
            //success:  fetchBlogList()
            success: function (data) {
                console.log("Silme işlemi başarılı", data);
                fetchBlogList();
            },
            error: handleError,
        }); //end ajax
    }); //end confirm

    fetchBlogList();
    updateCharCount(); //Başlangıçta karakter sayısını güncelle    
}); // end document.ready
