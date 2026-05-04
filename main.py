import tkinter as tk
from tkinter import messagebox
import random
import json
import os

DATA_FILE = "history.json"

tasks = [
    {"text": "Прочитать статью", "type": "Учёба"},
    {"text": "Сделать зарядку", "type": "Спорт"},
    {"text": "Сделать проект", "type": "Работа"}
]

history = []


# ---------- РАБОТА С JSON ----------
def save_data():
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=4)


def load_data():
    global history
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            history = json.load(f)


# ---------- ЛОГИКА ----------
def generate_task():
    if not tasks:
        messagebox.showwarning("Ошибка", "Нет задач")
        return

    task = random.choice(tasks)
    result_label.config(text=f"{task['text']} ({task['type']})")

    history.append(task)
    update_history()
    save_data()


def update_history(filter_type=None):
    listbox.delete(0, tk.END)

    for task in history:
        if filter_type and task["type"] != filter_type:
            continue
        listbox.insert(tk.END, f"{task['text']} ({task['type']})")


def add_task():
    text = entry_task.get()
    task_type = entry_type.get()

    if not text.strip():
        messagebox.showerror("Ошибка", "Пустая задача!")
        return

    tasks.append({"text": text, "type": task_type})

    entry_task.delete(0, tk.END)
    entry_type.delete(0, tk.END)


def apply_filter():
    f = filter_var.get()
    if f == "Все":
        update_history()
    else:
        update_history(f)


# ---------- GUI ----------
root = tk.Tk()
root.title("Random Task Generator")
root.geometry("400x400")

btn_generate = tk.Button(root, text="Сгенерировать задачу", command=generate_task)
btn_generate.pack(pady=5)

result_label = tk.Label(root, text="")
result_label.pack()

listbox = tk.Listbox(root, width=50)
listbox.pack(pady=5)

filter_var = tk.StringVar(value="Все")
filter_menu = tk.OptionMenu(root, filter_var, "Все", "Учёба", "Спорт", "Работа")
filter_menu.pack()

btn_filter = tk.Button(root, text="Фильтр", command=apply_filter)
btn_filter.pack(pady=5)

entry_task = tk.Entry(root)
entry_task.pack()
entry_task.insert(0, "Новая задача")

entry_type = tk.Entry(root)
entry_type.pack()
entry_type.insert(0, "Тип")

btn_add = tk.Button(root, text="Добавить", command=add_task)
btn_add.pack(pady=5)

load_data()
update_history()

root.mainloop()