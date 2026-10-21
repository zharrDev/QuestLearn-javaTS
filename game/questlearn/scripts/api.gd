extends Node
## HTTP client for the QuestLearn backend.
##
## Mirrors the web app's contract: POST /auth/login, GET /dunia/user,
## GET /typing/start, POST /typing/submit. The JWT is stored in
## user://session.json so the player only logs in once.

const DEFAULT_BASE := "http://localhost:8080/api"
const SESSION_PATH := "user://session.json"

var base_url: String = DEFAULT_BASE
var token: String = ""
var user: Dictionary = {}

func _ready() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--api="):
			base_url = arg.substr(6).rstrip("/")
	load_session()

func load_session() -> void:
	if not FileAccess.file_exists(SESSION_PATH):
		return
	var file := FileAccess.open(SESSION_PATH, FileAccess.READ)
	if file == null:
		return
	var parsed = JSON.parse_string(file.get_as_text())
	if typeof(parsed) == TYPE_DICTIONARY:
		token = str(parsed.get("token", ""))
		var saved_user = parsed.get("user", {})
		user = saved_user if typeof(saved_user) == TYPE_DICTIONARY else {}

func save_session() -> void:
	var file := FileAccess.open(SESSION_PATH, FileAccess.WRITE)
	if file == null:
		return
	file.store_string(JSON.stringify({"token": token, "user": user}))

func clear_session() -> void:
	token = ""
	user = {}
	if FileAccess.file_exists(SESSION_PATH):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(SESSION_PATH))

func is_logged_in() -> bool:
	return token != ""

func request(method: int, path: String, body = null) -> Dictionary:
	var http := HTTPRequest.new()
	http.timeout = 20.0
	add_child(http)
	var headers := PackedStringArray(["Content-Type: application/json", "Accept: application/json"])
	if token != "":
		headers.append("Authorization: Bearer " + token)
	var payload := ""
	if body != null:
		payload = JSON.stringify(body)
	var err := http.request(base_url + path, headers, method, payload)
	if err != OK:
		http.queue_free()
		return {"ok": false, "code": 0, "data": null, "message": "Tidak bisa menghubungi server (%s)" % err}
	var response: Array = await http.request_completed
	http.queue_free()

	var code := int(response[1])
	var raw: String = (response[3] as PackedByteArray).get_string_from_utf8()
	var parsed = JSON.parse_string(raw) if raw.length() > 0 else null
	var data = null
	var message := ""
	if typeof(parsed) == TYPE_DICTIONARY:
		data = parsed.get("data")
		message = str(parsed.get("message", ""))

	if code < 200 or code >= 300:
		if code == 401:
			clear_session()
		if message == "":
			message = "HTTP %d" % code
		return {"ok": false, "code": code, "data": data, "message": message}
	return {"ok": true, "code": code, "data": data, "message": message}

func login(email: String, password: String) -> Dictionary:
	var res: Dictionary = await request(HTTPClient.METHOD_POST, "/auth/login", {"email": email, "password": password})
	if res["ok"]:
		var payload: Dictionary = res["data"] if typeof(res["data"]) == TYPE_DICTIONARY else {}
		token = str(payload.get("token", ""))
		user = payload
		save_session()
	return res

func me() -> Dictionary:
	return await request(HTTPClient.METHOD_GET, "/auth/me")

func worlds() -> Dictionary:
	return await request(HTTPClient.METHOD_GET, "/dunia/user")

func start_typing(dunia_id: int, level: String) -> Dictionary:
	return await request(HTTPClient.METHOD_GET, "/typing/start?duniaId=%d&level=%s" % [dunia_id, level])

func submit_typing(result: Dictionary) -> Dictionary:
	return await request(HTTPClient.METHOD_POST, "/typing/submit", result)
