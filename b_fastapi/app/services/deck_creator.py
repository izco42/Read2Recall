from pathlib import Path
from uuid import uuid4
import genanki
from schemas.decks_schema import ConfirmDeckRequest, DeckCreationResult 
import json
from typing import List

card_css = """
.card {
  font-family: 'Arial';
  font-size: 20px;
  color: #2c3e50;
  background-color: #ecf0f1;
  text-align: center;
  padding: 20px;
}
hr#answer {
  margin-top: 25px;
  border: 1px solid #bdc3c7;
}
.my-question {
  font-weight: bold;
  color: #2980b9;
}
.my-answer {
  font-style: italic;
}
.my-hint {
  font-size: 16px;
  color: #7f8c8d;
  margin-top: 10px;
  font-style: italic;
}
""" 

metadata_dir = Path("/app/deck_meta")
metadata_dir.mkdir(parents=True, exist_ok=True)

def save_deck_metadata(deck_result: DeckCreationResult):
    metadata_path = metadata_dir / f"{deck_result.deck_id}.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(deck_result.dict(), f, ensure_ascii=False, indent=2)


def list_deck_metadata() -> List[DeckCreationResult]:
    metadata_dir.mkdir(parents=True, exist_ok=True)
    metadata_files = metadata_dir.glob("*.json")
    results = []
    for file in metadata_files:
        try:
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)
                results.append(DeckCreationResult(**data))
        except Exception:
            continue
    return results

def delete_deck_by_id(deck_id: int) -> bool:
    metadata_path = metadata_dir/ f"{deck_id}.json"
    
    if not metadata_path.exists():
        return False

    try:
        with open(metadata_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)
        apkg_path = Path(metadata.get("file_path", ""))

        if apkg_path.exists():
            apkg_path.unlink()

        metadata_path.unlink()

        return True
    except Exception:
        return False

def create_deck_from_request(data: ConfirmDeckRequest) -> DeckCreationResult:
    deck_id = int(uuid4().int >> 96)  
    model_id = data.template.template_id
    model_name = data.template.template_name
    front_fields = data.template.front
    back_fields = data.template.back

    total_fields = front_fields + back_fields

    fields_schema = [{"name": f} for f in total_fields]

    qfmt = '<div class="card">\n'
    for f in front_fields:
        qfmt += f'  <div class="my-question">{{{{{f}}}}}</div>\n'
    qfmt += '</div>'

    afmt = '{{FrontSide}}<hr id="answer">\n'
    for f in back_fields:
        afmt += f'  <div class="my-answer">{{{{{f}}}}}</div>\n'

    model = genanki.Model(
        model_id=model_id,
        name=model_name,
        fields=fields_schema,
        templates=[{
            'name': 'Template dinámico',
            'qfmt': qfmt,
            'afmt': afmt,
        }],
        css=card_css,
    )

    deck = genanki.Deck(
        deck_id=deck_id,
        name=data.deckname,
    )

    for entry in data.flashc:
        entry_dict = entry.model_dump()
        front_values = next((v for k, v in entry_dict.items() if isinstance(v, list) and "anverso" in k.lower()), [])
        back_values = next((v for k, v in entry_dict.items() if isinstance(v, list) and "reverso" in k.lower()), [])
        padded_front = front_values + [""] * (len(front_fields) - len(front_values))
        padded_back = back_values + [""] * (len(back_fields) - len(back_values))
        fields_values = padded_front[:len(front_fields)] + padded_back[:len(back_fields)]

        note = genanki.Note(
            model=model,
            fields=fields_values
        )
        deck.add_note(note)

    output_dir = Path("decks")
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / f"{data.deckname.replace(' ', '_')}_{deck_id}.apkg"
    genanki.Package(deck).write_to_file(str(output_path))

    result = DeckCreationResult(
    deck_name=data.deckname,
    deck_id=deck_id,
    file_path=str(output_path.resolve()),
    template_name=data.template.template_name,
    template_id=data.template.template_id
    )

    save_deck_metadata(result)

    return result


