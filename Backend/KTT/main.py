import json
import os
from typing import Any, Dict, Tuple

from flask import Flask, jsonify, request

from functions.detect_object import detect_objects
from functions.generate_recipe import generate_recipe_list, generate_recipe_content
from functions.authentication import signin, signup
from functions.database import save_recipe, give_review, fetch_user_recipes, update_user, save_scan_history, fetch_scan_history, delete_scan_history_item, clear_scan_history, save_diet_preferences, fetch_diet_preferences
from functions.storage import uploadJpgToStorage
from flask_cors import CORS


app = Flask(__name__)

CORS(app)

_CREDENTIALS_ERROR = "Request body must include non-empty 'email' and 'password' strings."


def _extract_credentials() -> Tuple[str | None, str, str]:
	"""Return sanitized credentials or raise ValueError when invalid."""
	payload = request.get_json(silent=True) or {}
	username = payload.get("username")
	email = payload.get("email")
	password = payload.get("password")
	if not isinstance(username, str) or not username.strip():
		if request.path.endswith("/signup"):
			raise ValueError(_CREDENTIALS_ERROR)
		else:
			username = None

	if not isinstance(email, str) or not email.strip():
		raise ValueError(_CREDENTIALS_ERROR)
	if not isinstance(password, str) or not password:
		raise ValueError(_CREDENTIALS_ERROR)
	return username, email.strip(), password


def _serialize_auth_response(auth_response: Any):
	"""Convert Supabase AuthResponse objects into JSON-safe data."""
	if auth_response is None:
		return None
	if isinstance(auth_response, (str, int, float, bool)):
		return auth_response
	if isinstance(auth_response, (list, tuple, set, frozenset)):
		return [_serialize_auth_response(item) for item in auth_response]
	if isinstance(auth_response, dict):
		return {
			str(key): _serialize_auth_response(value)
			for key, value in auth_response.items()
		}
	for attr in ("model_dump_json", "json"):
		serializer = getattr(auth_response, attr, None)
		if callable(serializer):
			try:
				serialized = serializer()
				if isinstance(serialized, (bytes, bytearray)):
					serialized = serialized.decode("utf-8")
				elif not isinstance(serialized, str):
					serialized = json.dumps(serialized, default=str)
				return json.loads(serialized)
			except Exception:  # pragma: no cover - defensive
				pass
	for attr in ("model_dump", "dict"):
		serializer = getattr(auth_response, attr, None)
		if callable(serializer):
			try:
				data = serializer()
			except Exception:  # pragma: no cover - defensive
				continue
			try:
				json.dumps(data, default=str)
				return data
			except Exception:  # pragma: no cover - defensive
				try:
					return json.loads(json.dumps(data, default=str))
				except Exception:
					pass
	if hasattr(auth_response, "__dict__"):
		try:
			data = auth_response.__dict__
			json.dumps(data, default=str)
			return data
		except Exception:  # pragma: no cover - defensive
			return json.loads(json.dumps(data, default=str))
	return str(auth_response)


@app.route("/upload-image", methods=["POST"])
def upload_image():
	payload = request.get_json(silent=True) or {}
	base64_jpg = payload.get("base64_jpg")

	if not isinstance(base64_jpg, str) or not base64_jpg.strip():
		return jsonify({"error": "Request body must include a non-empty 'base64_jpg' string."}), 400
	try:
		upload_res = uploadJpgToStorage(base64_jpg)
	except Exception as exc:
		return jsonify({"error": "Failed to upload image", "details": str(exc)}), 502
	return jsonify({"message": "Image uploaded successfully", "path": upload_res}), 200


@app.post("/signin")
def signin_route():
	try:
		_,email, password = _extract_credentials()
	except ValueError as exc:
		return jsonify({"error": str(exc)}), 400
	try:
		auth_response = signin(email, password)
	except Exception as exc:  # pragma: no cover - defensive guard
		return (
			jsonify({"error": "Failed to sign in", "details": str(exc)}),
			502,
		)
	result = _serialize_auth_response(auth_response)
	body: Dict[str, Any] = {"message": "Signed in successfully"}
	if isinstance(result, dict):
		body.update(result)
	elif result is not None:
		body["auth"] = result
	return jsonify(body), 200


@app.post("/signup")
def signup_route():
	try:
		username, email, password = _extract_credentials()
	except ValueError as exc:
		return jsonify({"error": str(exc)}), 400
	try:
		auth_response = signup(str(username), email, password)
	except Exception as exc:  # pragma: no cover - defensive guard
		return (
			jsonify({"error": "Failed to sign up", "details": str(exc)}),
			502,
		)
	result = _serialize_auth_response(auth_response)
	body: Dict[str, Any] = {
		"message": "Signup successful. Please verify your email if required."
	}
	if result is not None:
		body["auth"] = result
	return jsonify(body), 201




@app.post("/recipes-list")
def create_recipes():
	payload = request.get_json(silent=True) or {}
	image_url = payload.get("url")
	diet_preferences = payload.get("diet_preferences", [])

	if not isinstance(image_url, str) or not image_url.strip():
		return (
			jsonify({"error": "Request body must include a non-empty 'url' string."}),
			400,
		)

	try:
		ingredients = detect_objects(image_url)
	except Exception as exc:  # pragma: no cover - defensive guard
		return (
			jsonify({"error": "Failed to detect ingredients", "details": str(exc)}),
			500,
		)

	if not ingredients:
		return jsonify({"ingredients": [], "recipes": []}), 200

	recipes = generate_recipe_list(ingredients, diet_preferences)
	if recipes is None:
		return (
			jsonify({"error": "Failed to generate recipes"}),
			502,
		)

	return jsonify({"ingredients": ingredients, "recipes": recipes}), 200

@app.post("/recipes-content")
def create_recipe_content():
	payload = request.get_json(silent=True) or {}
	recipe = payload.get("recipe")

	if not isinstance(recipe, dict):
		return (
			jsonify({"error": "Request body must include a 'recipe' object."}),
			400,
		)

	try:
		recipe_content = generate_recipe_content(recipe)
	except Exception as exc:  # pragma: no cover - defensive guard
		return (
			jsonify({"error": "Failed to generate recipe content", "details": str(exc)}),
			502,
		)
	return jsonify({"steps": recipe_content.get("steps")}), 200

@app.route("/save-recipe", methods=["POST"])
def save_recipe_route():
	payload = request.get_json(silent=True) or {}
	user_id = payload.get("user_id")
	recipe_data = payload.get("recipe_data")

	if not isinstance(user_id, str) or not user_id.strip():
		return jsonify({"error": "Request body must include a non-empty 'user_id' string."}), 400
	if not isinstance(recipe_data, dict):
		return jsonify({"error": "Request body must include a 'recipe_data' object."}), 400

	try:
		save_response = save_recipe(user_id, recipe_data)
	except Exception as exc:
		return jsonify({"error": "Failed to save recipe", "details": str(exc)}), 502

	return jsonify({"message": "Recipe saved successfully", "response": save_response.data}), 200

@app.route("/give-review", methods=["POST"])
def give_review_route():
	payload = request.get_json(silent=True) or {}
	recipe_id = payload.get("recipe_id")
	reviews = payload.get("reviews")

	if not isinstance(recipe_id, str) or not recipe_id.strip():
		return jsonify({"error": "Request body must include a non-empty 'recipe_id' string."}), 400
	if not isinstance(reviews, int) or not (1 <= reviews <= 5):
		return jsonify({"error": "Request body must include a 'reviews' integer between 1 and 5."}), 400

	try:
		review_response = give_review(recipe_id, reviews)
	except Exception as exc:
		return jsonify({"error": "Failed to give review", "details": str(exc)}), 502

	return jsonify({"message": "Review submitted successfully", "response": review_response.data}), 200

@app.route("/fetch-recipes", methods=["POST"])
def fetch_recipes_route():
	payload = request.get_json(silent=True) or {}
	user_id = payload.get("user_id")

	if not isinstance(user_id, str) or not user_id.strip():
		return jsonify({"error": "Request body must include a non-empty 'user_id' string."}), 400

	try:
		recipes_response = fetch_user_recipes(user_id)
	except Exception as exc:
		return jsonify({"error": "Failed to fetch recipes", "details": str(exc)}), 502

	return jsonify({"recipes": recipes_response.data}), 200


@app.route("/update-user", methods=["POST"])
def update_user_route():
	payload = request.get_json(silent=True) or {}
	user_id = payload.get("user_id")
	updates = payload.get("updates")

	if not isinstance(user_id, str) or not user_id.strip():
		return jsonify({"error": "Request body must include a non-empty 'user_id' string."}), 400
	if not isinstance(updates, dict):
		return jsonify({"error": "Request body must include an 'updates' object."}), 400

	try:
		update_response = update_user(user_id, updates)
	except Exception as exc:
		return jsonify({"error": "Failed to update user", "details": str(exc)}), 502

	return jsonify({"message": "User updated successfully", "response": update_response.data}), 200


# ───────────────────────────────────────────────────────────────────────────────
# Scan History Endpoints
# ───────────────────────────────────────────────────────────────────────────────

@app.route("/save-history", methods=["POST"])
def save_history_route():
	payload = request.get_json(silent=True) or {}
	user_id = payload.get("user_id")
	ingredients = payload.get("ingredients")
	recipes_count = payload.get("recipes_count", 0)

	if not isinstance(user_id, str) or not user_id.strip():
		return jsonify({"error": "Request body must include a non-empty 'user_id' string."}), 400
	if not isinstance(ingredients, list):
		return jsonify({"error": "Request body must include an 'ingredients' array."}), 400

	try:
		history_response = save_scan_history(user_id, ingredients, recipes_count)
	except Exception as exc:
		return jsonify({"error": "Failed to save history", "details": str(exc)}), 502

	return jsonify({"message": "History saved successfully", "response": history_response.data}), 200


@app.route("/fetch-history", methods=["POST"])
def fetch_history_route():
	payload = request.get_json(silent=True) or {}
	user_id = payload.get("user_id")

	if not isinstance(user_id, str) or not user_id.strip():
		return jsonify({"error": "Request body must include a non-empty 'user_id' string."}), 400

	try:
		history_response = fetch_scan_history(user_id)
	except Exception as exc:
		return jsonify({"error": "Failed to fetch history", "details": str(exc)}), 502

	return jsonify({"history": history_response.data}), 200


@app.route("/delete-history-item", methods=["POST"])
def delete_history_item_route():
	payload = request.get_json(silent=True) or {}
	history_id = payload.get("history_id")
	user_id = payload.get("user_id")

	if not isinstance(history_id, str) or not history_id.strip():
		return jsonify({"error": "Request body must include a non-empty 'history_id' string."}), 400
	if not isinstance(user_id, str) or not user_id.strip():
		return jsonify({"error": "Request body must include a non-empty 'user_id' string."}), 400

	try:
		delete_response = delete_scan_history_item(history_id, user_id)
	except Exception as exc:
		return jsonify({"error": "Failed to delete history item", "details": str(exc)}), 502

	return jsonify({"message": "History item deleted successfully"}), 200


@app.route("/clear-history", methods=["POST"])
def clear_history_route():
	payload = request.get_json(silent=True) or {}
	user_id = payload.get("user_id")

	if not isinstance(user_id, str) or not user_id.strip():
		return jsonify({"error": "Request body must include a non-empty 'user_id' string."}), 400

	try:
		clear_response = clear_scan_history(user_id)
	except Exception as exc:
		return jsonify({"error": "Failed to clear history", "details": str(exc)}), 502

	return jsonify({"message": "History cleared successfully"}), 200


# Diet Preferences Endpoints
@app.post("/save-diet-preferences")
def save_diet_prefs():
	payload = request.get_json(silent=True) or {}
	user_id = payload.get("user_id")
	diet_preferences = payload.get("diet_preferences", [])

	if not isinstance(user_id, str) or not user_id.strip():
		return jsonify({"error": "user_id is required"}), 400

	if not isinstance(diet_preferences, list):
		return jsonify({"error": "diet_preferences must be an array"}), 400

	try:
		save_diet_preferences(user_id, diet_preferences)
	except Exception as exc:
		return jsonify({"error": "Failed to save diet preferences", "details": str(exc)}), 502

	return jsonify({"message": "Diet preferences saved successfully", "diet_preferences": diet_preferences}), 200


@app.post("/fetch-diet-preferences")
def fetch_diet_prefs():
	payload = request.get_json(silent=True) or {}
	user_id = payload.get("user_id")

	if not isinstance(user_id, str) or not user_id.strip():
		return jsonify({"error": "user_id is required"}), 400

	try:
		preferences = fetch_diet_preferences(user_id)
	except Exception as exc:
		return jsonify({"error": "Failed to fetch diet preferences", "details": str(exc)}), 502

	return jsonify({"diet_preferences": preferences or []}), 200


if __name__ == "__main__":
	port = int(os.environ.get("PORT", "5002"))
	debug = os.environ.get("FLASK_DEBUG", "0") == "1"
	app.run(host="0.0.0.0", port=port, debug=debug)
