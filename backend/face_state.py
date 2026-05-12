# backend/face_state.py

known_face_encodings = []
known_face_names = []

def add_face(encoding, name):
    global known_face_encodings, known_face_names
    known_face_encodings.append(encoding)
    known_face_names.append(name)

def update_face(encoding, name):
    global known_face_encodings, known_face_names
    if name in known_face_names:
        idx = known_face_names.index(name)
        known_face_encodings[idx] = encoding
    else:
        add_face(encoding, name)

def remove_face(name):
    global known_face_encodings, known_face_names
    if name in known_face_names:
        idx = known_face_names.index(name)
        known_face_encodings.pop(idx)
        known_face_names.pop(idx)
