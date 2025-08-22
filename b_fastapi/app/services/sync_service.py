from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.services.storage import Storage
from appwrite.input_file import InputFile
from appwrite.services.databases import Databases
from schemas.decks_schema import DeckCreationResult
from .deck_creator import save_deck_metadata
from appwrite.query import Query
from typing import Dict
from pathlib import Path
import os
import json
import re

DECKS_DIR = Path("/app/decks")
DECKS_DIR.mkdir(parents=True, exist_ok=True)
TEMPLATES_DIR = Path("/app/templates")
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)

def upload_deck_files(client : Client, user_id: str) -> Dict[str, str]:
    storage = Storage(client)
    uploaded = {}

    bucket_id = os.getenv("APPWRITE_BUCKET_ID_DECKS")

    for filename in os.listdir(DECKS_DIR):
        if not filename.endswith(".apkg"):
            continue

        full_path = os.path.join(DECKS_DIR, filename)

        existing_files = storage.list_files(
            bucket_id=bucket_id,
            queries=[
                Query.equal("name", [filename])
            ]
        )

        if any(f["name"] == filename for f in existing_files["files"]):
            print(f"[INFO] Skipping {filename}, already uploaded.")
            continue

        try:
            file = storage.create_file(
                bucket_id=bucket_id,
                file_id="unique()",
                file=InputFile.from_path(full_path),
                permissions=[f"read(\"user:{user_id}\")", f"write(\"user:{user_id}\")"]
            )
            uploaded[full_path] = file["$id"]
            print(f"[UPLOAD] {filename} -> {file['$id']}")
        except Exception as e:
            print(f"[ERROR] Could not upload {filename}: {e}")

    return uploaded

def upload_templates(client: Client, user_id: str):
    database_id = os.getenv("APPWRITE_DB_ID")
    collection_id = os.getenv("APPWRITE_COLLECTION_ID_TEMPLATES")  
    db = Databases(client)
    
    uploaded = []

    for filename in os.listdir(TEMPLATES_DIR):
        if not filename.endswith(".json"):
            continue

        file_path = os.path.join(TEMPLATES_DIR, filename)
        try:
            with open(file_path, "r") as f:
                data = json.load(f)

            template_id_str = str(data["template_id"])

            existing_docs = db.list_documents(
                database_id=database_id,
                collection_id=collection_id,
                queries=[
                    Query.equal("template_id", template_id_str),
                    Query.equal("user_id", user_id)
                ]
            )

            if existing_docs['total'] > 0:
                print(f"[SKIP] Template {template_id_str} already exists for user {user_id}")
                continue

            doc = {
                "template_id": template_id_str,
                "template_name": data["template_name"],
                "user_id": user_id,
                "front": data["front"],
                "back": data["back"]
            }

            db.create_document(
                database_id=database_id,
                collection_id=collection_id,
                document_id="unique()",
                data=doc,
                permissions=[
                    f"read(\"user:{user_id}\")",
                    f"write(\"user:{user_id}\")"
                ]
            )
            uploaded.append(template_id_str)
            print(f"[UPLOAD] Template {template_id_str} uploaded")

        except Exception as e:
            print(f"[ERROR] Failed to upload template from {filename}: {e}")
    
    return {"uploaded_templates": uploaded}

def get_meta_path_from_apkg(apkg_path: str) -> str:
    filename = os.path.basename(apkg_path)  
    match = re.search(r'(\d+)', filename)
    if not match:
        raise ValueError(f"No se pudo extraer número del archivo {filename}")
    number = match.group(1)
    meta_filename = f"{number}.json"
    return os.path.join("/app/deck_meta", meta_filename)

def upload_deck_metadata(client: Client, user_id: str, uploaded: Dict[str, str]):
    databases = Databases(client)
    database_id = os.getenv("APPWRITE_DB_ID")
    collection_id = os.getenv("APPWRITE_COLLECTION_ID_DECK_META")

    for path, file_id in uploaded.items():
        try:
            meta_path = get_meta_path_from_apkg(path)
            if not os.path.exists(meta_path):
                print(f"[ERROR] Metadata file not found for {path}")
                continue

            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)

            document = databases.create_document(
                database_id=database_id,
                collection_id=collection_id,
                document_id="unique()",
                data={
                    "deck_name": str(meta["deck_name"]),
                    "deck_id": str(meta["deck_id"]),
                    "template_name": str(meta["template_name"]),
                    "template_id": str(meta["template_id"]),
                    "file_id": str(file_id),
                    "user_id": str(user_id)
                },
                permissions=[
                    f'read("user:{user_id}")',
                    f'update("user:{user_id}")',
                    f'delete("user:{user_id}")'
                ]
            )
            print(f"[META] Subido metadata de {meta['deck_name']} con ID {document['$id']}")

        except Exception as e:
            print(f"[ERROR] No se pudo subir metadata de {path}: {e}")

def download_templates(client: Client, user_id: str):
    database_id = os.getenv("APPWRITE_DB_ID")
    collection_id = os.getenv("APPWRITE_COLLECTION_ID_TEMPLATES")
    db = Databases(client)

    remote_templates = db.list_documents(
        database_id=database_id,
        collection_id=collection_id,
        queries=[Query.equal("user_id", user_id)]
    )['documents']

    downloaded = []

    local_template_ids = set()
    for filename in os.listdir(TEMPLATES_DIR):
        if filename.endswith(".json"):
            local_template_ids.add(filename.replace(".json", ""))

    for template_doc in remote_templates:
        tid = template_doc["template_id"]
        if tid in local_template_ids:
            continue  # ya está local

        filepath = os.path.join(TEMPLATES_DIR, f"{tid}.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(template_doc, f, ensure_ascii=False, indent=2)
        downloaded.append(tid)
        print(f"[DOWNLOAD] Template {tid} downloaded")

    return {"downloaded_templates": downloaded}

metadata_dir = Path("/app/deck_meta")
metadata_dir.mkdir(parents=True, exist_ok=True)

def download_deck_files(client: Client, user_id: str) -> list[str]:
    """
    Descarga los archivos de mazo (.apkg) y sus metadatos (.json) desde Appwrite,
    guardando cada tipo de archivo en su directorio correspondiente.
    """
    database_id = os.getenv("APPWRITE_DB_ID")
    collection_id = os.getenv("APPWRITE_COLLECTION_ID_DECK_META")
    bucket_id = os.getenv("APPWRITE_BUCKET_ID_DECKS")

    db = Databases(client)
    storage = Storage(client)

    downloaded = []

    try:
        response = db.list_documents(
            database_id=database_id,
            collection_id=collection_id,
            queries=[Query.equal("user_id", user_id)]
        )

        for doc in response.get("documents", []):
            print(f"[CHECK] Procesando documento {doc['$id']} para usuario {user_id}")

            deck_id = str(doc["deck_id"])
            filename = f"{doc['deck_name']}_{deck_id}.apkg"
            
            filepath = DECKS_DIR / filename

            if filepath.exists():
                print(f"[SKIP] El mazo {filename} ya existe localmente en {DECKS_DIR}.")
                continue

            file_id = doc["file_id"]

            try:
                
                file_data = storage.get_file_download(bucket_id=bucket_id, file_id=file_id)
                
                with open(filepath, "wb") as f:
                    f.write(file_data)

                print(f"[DOWNLOAD] Mazo {filename} descargado exitosamente en {DECKS_DIR}.")

                result = DeckCreationResult(
                    deck_name=doc["deck_name"],
                    deck_id=int(doc["deck_id"]),
                    file_path=str(filepath.resolve()), 
                    template_name=doc["template_name"],
                    template_id=doc["template_id"]
                )
                
                save_deck_metadata(result)
                print(f"[METADATA] Metadatos para el mazo {deck_id} guardados en {metadata_dir}.")

                downloaded.append(deck_id)

            except Exception as e:
                print(f"[ERROR] Fallo al descargar el mazo {filename}: {e}")

    except Exception as e:
        print(f"[ERROR] Fallo al listar los documentos: {e}")

    return downloaded