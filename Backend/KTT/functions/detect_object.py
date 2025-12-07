import requests
from io import BytesIO
from PIL import Image
import torch
from transformers import AutoProcessor, Owlv2ForObjectDetection

processor = AutoProcessor.from_pretrained("google/owlv2-base-patch16")
model = Owlv2ForObjectDetection.from_pretrained("google/owlv2-base-patch16")

DEFAULT_LABELS = [
    # Common Vegetables & Produce
    "potato",
    "sweet potato",
    "carrot",
    "broccoli",
    "cauliflower",
    "cabbage",
    "lettuce",
    "spinach",
    "kale",
    "tomato",
    "onion",
    "red onion",
    "garlic",
    "ginger",
    "cucumber",
    "zucchini",
    "eggplant",
    "bell pepper",
    "red pepper",
    "green pepper",
    "chili pepper",
    "jalapeno",
    "mushroom",
    "corn",
    "peas",
    "green beans",
    "asparagus",
    "celery",
    "leek",
    "radish",
    "beet",
    "turnip",
    "squash",
    "pumpkin",
    "avocado",
    "olives",
    "pickles",

    # Fruits
    "apple",
    "banana",
    "orange",
    "lemon",
    "lime",
    "strawberry",
    "blueberry",
    "grape",
    "mango",
    "pineapple",
    "watermelon",
    "peach",
    "pear",
    "cherry",
    "kiwi",
    "coconut",

    # Proteins
    "chicken",
    "chicken breast",
    "chicken thigh",
    "grilled chicken",
    "fried chicken",
    "beef",
    "steak",
    "ground beef",
    "beef patty",
    "pork",
    "pork chop",
    "bacon",
    "ham",
    "sausage",
    "lamb",
    "fish",
    "salmon",
    "tuna",
    "shrimp",
    "prawns",
    "crab",
    "lobster",
    "egg",
    "tofu",
    "paneer",

    # Dairy & Cheese
    "milk",
    "butter",
    "cream",
    "yogurt",
    "cheese",
    "cheddar cheese",
    "mozzarella cheese",
    "parmesan cheese",
    "feta cheese",
    "cream cheese",

    # Grains & Carbs
    "rice",
    "pasta",
    "noodles",
    "bread",
    "sandwich bread",
    "burger bun",
    "tortilla",
    "pita bread",
    "naan",
    "pizza dough",
    "flour",
    "oats",
    "quinoa",

    # Legumes & Nuts
    "beans",
    "black beans",
    "kidney beans",
    "chickpeas",
    "lentils",
    "peanuts",
    "almonds",
    "walnuts",
    "cashews",

    # Herbs & Spices
    "basil",
    "cilantro",
    "parsley",
    "mint",
    "rosemary",
    "thyme",
    "oregano",
    "dill",
    "salt",
    "black pepper",
    "cumin",
    "paprika",
    "turmeric",
    "cinnamon",
    "chili flakes",

    # Sauces & Condiments
    "ketchup",
    "mustard",
    "mayonnaise",
    "soy sauce",
    "olive oil",
    "vegetable oil",
    "vinegar",
    "honey",
    "hot sauce",
    "bbq sauce",
    "salsa",
    "pesto",

    # Prepared Foods
    "french fries",
    "potato wedges",
    "hash brown",
    "pizza",
    "burger",
    "sandwich",
    "salad",
    "soup"
]


def detect_objects(url: str, labels=None, threshold: float = 0.2):
    """Detect objects specified by labels in an image.

    If the URL starts with "https://" the image will be downloaded via
    requests.get(stream=True). Otherwise it will be opened locally. A leading
    "file://" prefix (if present) is stripped.

    Parameters
    ----------
    url : str
        HTTPS URL to the image or a local filesystem path (absolute or relative).
    labels : list[str] | None
        List of text labels to search for. If None, a default food-related set is used.
    threshold : float
        Confidence threshold for object detection filtering.

    Returns
    -------
    list[str]
        Unique detected labels present in the image above the threshold.
    """
    if labels is None:
        labels = DEFAULT_LABELS

    # Load image conditionally based on URL scheme
    if url.startswith("https://"):
        response = requests.get(url, stream=True)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content))
    else:
        # Treat as local path (strip optional file://)
        local_path = url[len("file://"):] if url.startswith("file://") else url
        image = Image.open(local_path)

    texts = [labels]
    inputs = processor(text=texts, images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)

    target_sizes = torch.tensor([image.size[::-1]])  # (height, width)
    results = processor.post_process_object_detection(
        outputs=outputs, threshold=threshold, target_sizes=target_sizes
    )

    boxes, scores, label_indices = (
        results[0]["boxes"],
        results[0]["scores"],
        results[0]["labels"],
    )

    detected = []
    seen = set()
    for score, label_idx in zip(scores, label_indices):
        name = texts[0][label_idx]
        if name in seen:
            continue
        seen.add(name)
        detected.append(name)
    return detected

__all__ = ["detect_objects", "DEFAULT_LABELS"]

