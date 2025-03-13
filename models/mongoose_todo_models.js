// MongoDB için veritabanı işlemlerinde kullanmak üzere `MongoTodoModel` adında model oluşturalım.
// Mongoose adında ki kütüphaneyi ekle ve bu kütüphaneye erişmek için `mongoose` adını kullan.
// mongoose paketini sisteme dahil ediyoruz.
// Mongoose MongoDB ile bağlantı kurarken sağlıklı ve hızlı bağlantısı için  bir ODM(Object Data Modeling)
// NOT: Eğer bu sayfada Typescript kullansaydım reqire yerine import kullanacaktım.
// Import
const mongoose = require("mongoose");

// Schema adından (TodoPostSchema)
const TodoPostSchema = new mongoose.Schema({
    // 1.YOL (TODOHEADER)
    //header: String,

    // 2.YOL (TODOHEADER)
    todoHeader: {
        type: String,
        required: [true, " Todo Başlığı için gereklidir"],
        trim: true,
        minleght: [5, "Todo başlığı için minumum 5 karakter olmalıdır."],
        maxleght: [100, "Todo başlığı için maksimum 100 karakter olmalıdır."],
    },

    // TODOCONTENT
    // todocontent: String,
    todoContent: {
        type: String,
        required: [true, " Todo içeriği için gereklidir"],
        trim: true,
        minleght: [5, "Todo başlığı için minumum 5 karakter olmalıdır."],
    },

    // DATE
    dateInformation: {
        type: String, default: Date.now(),
    },

    // VIEWS
    // Todo Görüntüleme (Default: 0)
    // views: {
    //     type: Number, default: 0, min: [0, "Todo gösterimi için Negatif değer verilmez"],
    // },

    // STATUS
    // Durum (Proje için bu bir taslak mı yoksa canlı ortam için mi ?)
    // Enum Durum Alanı: status: Todo gönderisinin durumu "draft" veya "published" olarak belirlenir. Bu, bir gönderinin taslak mı yoksa yayınlanmış mı olduğunu gösterir.
    status: {
        type: String, enum: ["draft", "published"], default: "draft",
    },
}, //end TodoPostSchema {}
    {
        // Oluşturma ve güncellemem zamanları sisteme eklemek
        // Zaman Bilgileri: timestamps: createdAt ve updatedAt alanları otomatik olarak eklenir ve her işlemde güncellenir.
        timestamps: true,
    }); //end PostSchema

////////////////////////////////////////////////////////////////////
// Sanal alan (Virtuals) - İçerik özetini döndürme
// summary: Todo içeriğinin ilk 100 karakterini döndüren bir sanal alan ekledik.
// Bu, API cevaplarında sadece kısa bir özet göstermek için kullanılabilir.
TodoPostSchema.virtual("summary").get(function () {
    return this.todoContent.substring(0, 100) + "..."; // İlk 100 karakter ve ardından ...
});

// Şema için ön middleware - Her kaydetmeden önce başlık ve içeriği büyük harflerle güncelleme
// Şema Middleware (Pre-save Hook): pre("save"): Kaydedilmeden önce başlık ve içeriğin ilk harflerini büyük yapmak için bir ön middleware ekledik.
TodoPostSchema.pre("save", function (next) {
    this.todoHeader = this.todoHeader.charAt(0).toUpperCase() + this.todoHeader.slice(1);
    this.todoContent = this.todoContent.charAt(0).toUpperCase() + this.todoContent.slice(1);
    next();
});

// Statik metot - Belirli bir yazara ait tüm Todoları bulma
// Statik Metot: findByAuthor: Belirli bir yazara ait tüm Todo gönderilerini bulmak için statik bir metot ekledik. Bu, belirli yazara göre Todo filtrelemek için kullanılabilir.
// TodoPostSchema.statics.findByAuthor = function (authorName) {
//     return this.find({ author: authorName });
// };

// Instance metodu - Görüntüleme sayısını artırma
// Instance Metot: incrementViews: Her Todo gönderisine ait görüntüleme sayısını artırmak için bir instance metot ekledik. Bu, bir gönderi görüntülendiğinde görüntüleme sayısını artırmanızı sağlar.
// TodoPostSchema.methods.incrementViews = function () {
//     this.views += 1;
//     return this.save();
// };

// Sanal alanların JSON'a dahil edilmesi
TodoPostSchema.set("toJSON", { virtuals: true });

// Module Exports modelName(TodoModel)
// TodoModel modelini dışa aktarmak
// Post kullanımı daha yaygındır
// module.exports = mongoose.model('Post', TodoPostSchema );

// Module
// 1.YOL
// module.exports = mongoose.model("MongoTodoModel", TodoPostSchema);

// 2.YOL
const Todo = mongoose.model("MongoTodoModel", TodoPostSchema, "posts");
module.exports = Todo;
