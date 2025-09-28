
# 🧠 PDF-to-Anki Flashcard Generator  

An offline-first application that allows you to *load PDFs and generate .apkg files* directly exportable to [Anki](https://apps.ankiweb.net/).  
The app uses *local AI models* (via [LM Studio](https://lmstudio.ai/)) to read and process content, adapting it into predefined *flashcard templates*.  

For example:  
- A language-learning template may include: Spanish_verb → English_verb → Example_sentence_in_English.  
- A concept-learning template may include: Concept → Explanation.  

You can also generate flashcards *without a PDF*, using only a prompt/topic (⚠️ this option is computationally expensive).  

The project is designed to work *completely offline* (no reliance on paid cloud services).  
Optionally, you can create an account to store your templates and decks in the cloud, but this is *not required* to use the software.  

---

## 🚀 Features  
- 📄 Load PDFs and automatically generate *Anki flashcards* (.apkg).  
- 🧩 Create customizable flashcard templates.  
- 🤖 Use local AI models from *LM Studio* (any family/size).  
- ⚡ Run entirely *offline*, no external cloud dependencies.  
- ☁️ Optional cloud storage for templates and decks (does not block usage).  
- 🎯 Supports prompt-only flashcard generation (without PDFs).  

---

## 📋 Requirements  
- [Docker](https://www.docker.com/)  
- [Python](https://www.python.org/)  
- [LM Studio](https://lmstudio.ai/) (with a locally installed model)  

---

## 🛠️ Installation  

Clone the repository:  
bash
git clone https://github.com/izco42/Read2Recall.git
cd Read2Recall


## ▶️ Usage  

Run the launcher:  

```bash
python launcher.py
```

This will start all services.
Open your browser at:

```bash
http://localhost:3000
```

## ⚠️ Notes

Prompt-only flashcard generation (without PDFs) may consume significant computational resources.

Decks are exported as .apkg files, ready to be imported into Anki.

LM Studio lets you choose any model and allocate more resources depending on your system.
