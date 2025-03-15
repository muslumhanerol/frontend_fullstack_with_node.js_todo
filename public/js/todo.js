//Sayfa yüklendiğinde çalışacak. Sayfa yüklenmeden javascrip çalışmayacağı için hata alınmaz.
$(document).ready(function () {

    let isUpdating = false;
    let updateId = null;
    const maxCharacters = 500;

    const resetForm = () => {
        $("#todoHeader").val("");
        $("#todoContent").val("");
        $("#todoCategory").val("");
        isUpdating = false;
        updateId = null;
    };

    const clearErrors = () => {
        $(".error-message, .valid-message").remove();
    };

    const showError = (element, message) => {
        $(element).next(".error-message, .valid-message").remove();
        $(element).after(
            `<small class="text-warning error-message">${message}</small>`
        );
    };

    const showValid = (element, message) => {
        $(element).next(".error-message, .valid-message").remove();
        $(element).after(
            `<small class="text-success valid-message">${message}</small>`
        );
    };


    //Todo Kategori
    // const categories = ["Eğitim", "Finans", "Sağlık", "Sosyal"]
    // categories.forEach((todoCategory) => {
    //     $("#category").append(`<option value="${todoCategory}">${todoCategory}</option>`)
    // });


    const updateCharCount = () => {
        const todoContent = $("#todoContent").val();
        const charCount = todoContent.length;
        const remainingChars = maxCharacters - charCount;
        $("#char-count").text(`Kalan Harf sayısı: ${remainingChars}`);

        if (remainingChars < 0) {
            $("#char-count").removeClass("text-success").addClass("text-danger");
            showError(
                "#todoContent",
                "Karakter sınırını aştınız. En fazla 500 karakter girebilirsiniz."
            );
        } else {
            $("#char-count").removeClass("text-danger").addClass("text-success");
            $(".error-message").remove();
        }
    };

    $("#todoContent").on("input", function () {
        updateCharCount();
    });

    const validateForm = () => {
        clearErrors();
        let isValid = true;
        const todoHeader = $("#todoHeader").val().trim();
        const todoContent = $("#todoContent").val().trim();


        if (!todoHeader) {
            showError("#todoHeader", "Başlık alanı boş bırakılamaz.");
            isValid = false;
        }
        if (!todoContent || todoContent.length > maxCharacters) {
            showError("#todoContent", "İçerik alanı uygun değil.");
            isValid = false;
        }
        return isValid;
    };

    $("#todo-form").on("submit", function (event) {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }

        const todoData = {
            todoHeader: $("#todoHeader").val(),
            todoContent: $("#todoContent").val(),
            todoCategory: $("#todoCategory").val(),
            _csrf: $("input[name='_csrf']").val(),
        };

        const ajaxOptions = {
            url: isUpdating ? `/todo/api/${updateId}` : "/todo/api/",
            method: isUpdating ? "PUT" : "POST",
            data: todoData,
            success: function (data) {
                console.log("İşlem başarılı", data);
                fetchTodoList();
                resetForm();
            },
            error: function (xhr, status, error) {
                console.error("İşlem başarısız:", error);
            },
        };

        $.ajax(ajaxOptions);
    });

    $("#todo-table tbody").on("click", ".edit-btn", function () {
        const row = $(this).closest("tr");
        updateId = row.data("id");

        if (!updateId) {
            alert("Bu Todo kaydının ID’si eksik, düzenleme yapılamaz!");
            return;
        }

        $("#todoHeader").val(row.find("td:eq(1)").text());
        $("#todoContent").val(row.find("td:eq(2)").text());
        $("#todoCategory").val(row.find("td:eq(3)").text());
        isUpdating = true;
        $("#submit-btn").text("Güncelle");

        console.log("Güncellenen ID:", updateId);
    });


    $("#todo-table tbody").on("click", ".delete-btn", function () {
        const deleteId = $(this).closest("tr").data("id");

        if (!deleteId) {
            alert("Silinecek Todo ID’si bulunamadı!");
            return;
        }

        if (!confirm(`${deleteId} numaralı ID'yi silmek istediğinize emin misiniz?`))
            return;

        $.ajax({
            url: `/todo/api/${deleteId}`,
            method: "DELETE",
            success: function (data) {
                console.log("Silme işlemi başarılı", data);
                fetchTodoList();
            },
            error: function (xhr, status, error) {
                console.error("Silme işlemi başarısız:", error);
            },
        });
    });


    //Tümünü Sill   





    const fetchTodoList = () => {
        $.ajax({
            url: "/todo/api/",
            method: "GET",
            success: function (data) {
                const $tbody = $("#todo-table tbody").empty();
                data.forEach((item) => {
                    $tbody.append(`
            <tr data-id="${item.id}">
              <td>${item.id}</td>
              <td>${item.todoHeader}</td>
              <td>${item.todoContent}</td>
              <td>${item.todoCategory || "Bilinmiyor"}</td>
              <td>${item.createdAt}</td>
              <td>
                <button class="btn btn-warning btn-sm edit-btn"><i class="fa-solid fa-eraser"></i></button>
                <button class="btn btn-danger btn-sm delete-btn"><i class="fa-solid fa-trash-can"></i></button>                               
              </td>
            </tr>
          `);
                });
            },
            error: function (xhr, status, error) {
                console.error("Listeleme başarısız:", error);
            },
        });
    };

    fetchTodoList();
    updateCharCount();
});
