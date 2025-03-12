// Express Import
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// JSON-SERVER(DB) yolunu göstermek
const dbFilePath = path.join(__dirname, "../db.json");

// Hata Yönetimi Fonksiyonu
const handleError = (res, message) => {
    return res.status(400).json({ error: message });
};

// JSON-SERVER(DB) VERİ OKUMA
const readDB = () => {
    try {
        const data = fs.readFileSync(dbFilePath, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return { todos: [] };
    }
};

// JSON-SERVER(DB) VERİ YAZMA
const writeDB = (data) => {
    try {
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
        console.error("Veri yazma hatası:", error);
    }
};

// TODO OLUŞTURMA (CREATE)
router.post("/", (req, res) => {
    try {
        const { todoHeader, todoContent } = req.body;
        if (!todoHeader || !todoContent) {
            return handleError(res, "Tüm alanlar gereklidir!");
        }

        let db = readDB();
        const newTodo = {
            id: db.todos.length ? db.todos[db.todos.length - 1].id + 1 : 1,
            todoHeader,
            todoContent,
            createdAt: new Date().toISOString(),
        };

        db.todos.push(newTodo);
        writeDB(db);

        res.status(201).json(newTodo);
    } catch (error) {
        handleError(res, "Todo ekleme işlemi başarısız!");
    }
});

// TÜM TODOLARI LİSTELEME (READ)
router.get("/", (req, res) => {
    try {
        const db = readDB();
        res.status(200).json(db.todos);
    } catch (error) {
        handleError(res, "TODO listeleme başarısız");
    }
});

// TEK BİR TODO GETİRME (READ)
router.get("/:id", (req, res) => {
    try {
        const db = readDB();
        const todo = db.todos.find((b) => b.id === parseInt(req.params.id));
        if (!todo) return handleError(res, "Todo bulunamadı!");
        res.status(200).json(todo);
    } catch (error) {
        handleError(res, "Todo getirme başarısız");
    }
});

// TODO GÜNCELLEME (UPDATE)
router.put("/:id", (req, res) => {
    try {
        let db = readDB();
        const todoIndex = db.todos.findIndex(
            (b) => b.id === parseInt(req.params.id)
        );
        if (todoIndex === -1) return handleError(res, "Todo bulunamadı!");

        db.todos[todoIndex] = { ...db.todos[todoIndex], ...req.body };
        writeDB(db);
        res.status(200).json(db.todos[todoIndex]);
    } catch (error) {
        handleError(res, "Todo güncelleme başarısız!");
    }
});

// TODO SİLME (DELETE)
router.delete("/:id", (req, res) => {
    try {
        let db = readDB();
        const newTodos = db.todos.filter((b) => b.id !== parseInt(req.params.id));
        if (db.todos.length === newTodos.length)
            return handleError(res, "Todo bulunamadı!");

        db.todos = newTodos;
        writeDB(db);
        res.status(200).json({ message: "Todo başarıyla silindi." });
    } catch (error) {
        handleError(res, "Todo silme başarısız!");
    }
});

module.exports = router;
