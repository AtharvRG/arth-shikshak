import tkinter as tk
from tkinter import ttk, filedialog, messagebox, font

class TextEditor:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Untitled - Text Editor")
        self.root.geometry("800x600")

        self.file_path = None
        self.theme = 'light'
        self._setup_ui()
        self._bind_shortcuts()

    def _setup_ui(self):
        self._create_menu()
        self._create_toolbar()
        self._create_text_widget()
        self._create_status_bar()

    def _create_menu(self):
        self.menu_bar = tk.Menu(self.root)
        self.root.config(menu=self.menu_bar)

        # File Menu
        file_menu = tk.Menu(self.menu_bar, tearoff=0)
        file_menu.add_command(label="New", accelerator="Ctrl+N", command=self.new_file)
        file_menu.add_command(label="Open", accelerator="Ctrl+O", command=self.open_file)
        file_menu.add_command(label="Save", accelerator="Ctrl+S", command=self.save_file)
        file_menu.add_command(label="Save As", accelerator="Ctrl+Shift+S", command=self.save_as)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.exit_editor)
        self.menu_bar.add_cascade(label="File", menu=file_menu)

        # Edit Menu
        edit_menu = tk.Menu(self.menu_bar, tearoff=0)
        edit_menu.add_command(label="Undo", accelerator="Ctrl+Z", command=lambda: self.text_edit.event_generate('<<Undo>>'))
        edit_menu.add_command(label="Redo", accelerator="Ctrl+Y", command=lambda: self.text_edit.event_generate('<<Redo>>'))
        edit_menu.add_separator()
        edit_menu.add_command(label="Cut", accelerator="Ctrl+X", command=lambda: self.text_edit.event_generate('<<Cut>>'))
        edit_menu.add_command(label="Copy", accelerator="Ctrl+C", command=lambda: self.text_edit.event_generate('<<Copy>>'))
        edit_menu.add_command(label="Paste", accelerator="Ctrl+V", command=lambda: self.text_edit.event_generate('<<Paste>>'))
        edit_menu.add_separator()
        edit_menu.add_command(label="Select All", accelerator="Ctrl+A", command=lambda: self.text_edit.event_generate('<<SelectAll>>'))
        self.menu_bar.add_cascade(label="Edit", menu=edit_menu)

        # Format Menu
        format_menu = tk.Menu(self.menu_bar, tearoff=0)
        format_menu.add_command(label="Bold", accelerator="Ctrl+B", command=self.toggle_bold)
        format_menu.add_command(label="Italic", accelerator="Ctrl+I", command=self.toggle_italic)
        size_menu = tk.Menu(format_menu, tearoff=0)
        for size in range(8, 30, 2):
            size_menu.add_command(label=str(size), command=lambda s=size: self.set_font_size(s))
        format_menu.add_cascade(label="Font Size", menu=size_menu)
        self.menu_bar.add_cascade(label="Format", menu=format_menu)

        # Theme Menu
        theme_menu = tk.Menu(self.menu_bar, tearoff=0)
        theme_menu.add_command(label="Light", command=lambda: self.set_theme('light'))
        theme_menu.add_command(label="Dark", command=lambda: self.set_theme('dark'))
        self.menu_bar.add_cascade(label="Theme", menu=theme_menu)

    def _create_toolbar(self):
        self.toolbar = ttk.Frame(self.root, padding=2)
        self.toolbar.pack(fill='x')

        ttk.Button(self.toolbar, text='New', command=self.new_file).pack(side='left')
        ttk.Button(self.toolbar, text='Open', command=self.open_file).pack(side='left')
        ttk.Button(self.toolbar, text='Save', command=self.save_file).pack(side='left')
        ttk.Button(self.toolbar, text='Bold', command=self.toggle_bold).pack(side='left')
        ttk.Button(self.toolbar, text='Italic', command=self.toggle_italic).pack(side='left')
        ttk.Button(self.toolbar, text='Theme', command=self.toggle_theme).pack(side='left')

    def _create_text_widget(self):
        self.text_edit = tk.Text(self.root, undo=True, wrap='word')
        self.text_edit.pack(expand=1, fill='both')
        self.text_edit.bind('<<Modified>>', self.update_status)

        # Configure default font
        self.current_font = font.Font(font=self.text_edit['font'])
        self.text_edit.configure(font=self.current_font)
        self.set_theme(self.theme)

        # Scrollbar
        scroll = ttk.Scrollbar(self.text_edit, command=self.text_edit.yview)
        scroll.pack(side='right', fill='y')
        self.text_edit.config(yscrollcommand=scroll.set)

    def _create_status_bar(self):
        self.status = ttk.Label(self.root, text='Ln 1, Col 1', anchor='w')
        self.status.pack(fill='x', side='bottom')

    def _bind_shortcuts(self):
        self.text_edit.bind('<Control-n>', lambda e: self.new_file())
        self.text_edit.bind('<Control-o>', lambda e: self.open_file())
        self.text_edit.bind('<Control-s>', lambda e: self.save_file())
        self.text_edit.bind('<Control-S>', lambda e: self.save_as())
        self.text_edit.bind('<Control-q>', lambda e: self.exit_editor())
        self.text_edit.bind('<Control-b>', lambda e: self.toggle_bold())
        self.text_edit.bind('<Control-i>', lambda e: self.toggle_italic())

    def new_file(self):
        if self._confirm_discard():
            self.text_edit.delete(1.0, tk.END)
            self.file_path = None
            self.root.title("Untitled - Text Editor")

    def open_file(self):
        if not self._confirm_discard():
            return
        path = filedialog.askopenfilename(filetypes=[('Text Files', '*.txt'), ('All Files', '*.*')])
        if path:
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.text_edit.delete(1.0, tk.END)
                self.text_edit.insert(tk.END, content)
                self.file_path = path
                self.root.title(f"{path} - Text Editor")
            except Exception as e:
                messagebox.showerror("Error", str(e))

    def save_file(self):
        if self.file_path:
            try:
                with open(self.file_path, 'w', encoding='utf-8') as f:
                    f.write(self.text_edit.get(1.0, tk.END))
                messagebox.showinfo("Saved", "File saved successfully")
            except Exception as e:
                messagebox.showerror("Error", str(e))
        else:
            self.save_as()

    def save_as(self):
        path = filedialog.asksaveasfilename(defaultextension='.txt', filetypes=[('Text Files', '*.txt'), ('All Files', '*.*')])
        if path:
            try:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(self.text_edit.get(1.0, tk.END))
                self.file_path = path
                self.root.title(f"{path} - Text Editor")
                messagebox.showinfo("Saved", "File saved successfully")
            except Exception as e:
                messagebox.showerror("Error", str(e))

    def exit_editor(self):
        if self._confirm_discard():
            self.root.destroy()

    def toggle_bold(self):
        weight = 'bold' if self.current_font.cget('weight') != 'bold' else 'normal'
        self.current_font.configure(weight=weight)
        self.text_edit.configure(font=self.current_font)

    def toggle_italic(self):
        slant = 'italic' if self.current_font.cget('slant') != 'italic' else 'roman'
        self.current_font.configure(slant=slant)
        self.text_edit.configure(font=self.current_font)

    def set_font_size(self, size):
        self.current_font.configure(size=size)
        self.text_edit.configure(font=self.current_font)

    def set_theme(self, theme):
        if theme == 'dark':
            bg, fg = '#1e1e1e', '#ffffff'
        else:
            bg, fg = '#ffffff', '#000000'
        self.text_edit.configure(background=bg, foreground=fg, insertbackground=fg)
        self.theme = theme

    def toggle_theme(self):
        self.set_theme('dark' if self.theme == 'light' else 'light')

    def update_status(self, event=None):
        row, col = self.text_edit.index(tk.INSERT).split('.')
        self.status.config(text=f"Ln {row}, Col {int(col)+1}")
        self.text_edit.edit_modified(False)

    def _confirm_discard(self):
        if self.text_edit.edit_modified():
            response = messagebox.askyesnocancel("Unsaved Changes", "Save changes before proceeding?")
            if response:  # Yes
                self.save_file()
                return True
            elif response is False:  # No
                return True
            else:  # Cancel
                return False
        return True

    def run(self):
        self.root.mainloop()

if __name__ == '__main__':
    TextEditor().run()
