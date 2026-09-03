#!/usr/bin/env bash
# Genera las fotos de demo de Foodzinder con claude-banana (Gemini).
# Bloque de estilo compartido para que todas las fotos parezcan de la misma serie editorial.
set -u
BANANA="${CLAUDE_BANANA_DIR:-../claude-banana}"  # ruta a https://github.com/Hainrixz/claude-banana con GOOGLE_AI_API_KEY en su .env
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/images"
mkdir -p "$OUT/restaurants" "$OUT/dishes"

STYLE_COVER="Editorial photograph for a restaurant guide, shot on a 35mm lens at eye level with natural window light and a warm, slightly desaturated palette. Real textures: worn wood, ceramic, linen, glass. The space feels lived-in and welcoming, with a few diners out of focus in the background and no readable text or signs anywhere."
STYLE_DISH="Editorial food photograph for a restaurant menu, shot from a three-quarter angle with soft directional daylight from the left, shallow depth of field on a 50mm lens. The dish sits on a plain ceramic plate over a natural wood or linen surface, styled simply and honestly, with no props that distract and no readable text anywhere."

gen() { # gen <tipo> <nombre> <aspect> <prompt>
  local dir="$1" name="$2" aspect="$3" prompt="$4"
  local png="$OUT/$dir/$name.png"
  if [ -f "$OUT/$dir/$name.jpg" ]; then echo "skip $dir/$name"; return; fi
  echo "== $dir/$name"
  python "$BANANA/scripts/generate.py" --prompt "$prompt" --aspect "$aspect" --size 1K --output "$png" 2>&1 | tail -2
  if [ -f "$png" ]; then
    python -c "
from PIL import Image; import sys
im = Image.open(sys.argv[1]).convert('RGB')
im.thumbnail((1600, 1600))
im.save(sys.argv[2], 'JPEG', quality=82, optimize=True, progressive=True)
" "$png" "$OUT/$dir/$name.jpg" && rm -f "$png" && echo "ok -> $name.jpg"
  else
    echo "FALLO $dir/$name"
  fi
}

# ---------- Portadas (16:9) ----------
gen restaurants casa-terral 16:9 "$STYLE_COVER Interior of a traditional Madrid casa de comidas: a long marble bar with a steaming clay pot of cocido, a tiled floor, framed old photographs, wine bottles on shelves and a loaf of rustic bread on the counter."
gen restaurants kaiseki-ronda 16:9 "$STYLE_COVER A twelve-seat Japanese omakase counter in pale hinoki wood, a chef's hands slicing tuna behind it, minimalist ceramics, a single ikebana branch and warm low pendant lighting over the counter."
gen restaurants la-tasquita-de-lavapies 16:9 "$STYLE_COVER A small, lively Madrid tapas bar with a marble counter, tortilla de patata on a cake stand, draft beer taps, chalk menu boards without legible writing and a narrow terrace visible through the open door onto a leafy square."
gen restaurants marina-blava 16:9 "$STYLE_COVER A seafront Mediterranean restaurant in Barcelona with floor-to-ceiling windows onto the sea, white tablecloths, a large paella pan of black rice on a stand and blue afternoon light with the beach softly out of focus."
gen restaurants vermuteria-el-born 16:9 "$STYLE_COVER A tiny vermouth bar in Barcelona's Born district: upright wine barrels used as tables, a brass vermouth tap, tins of anchovies stacked on shelves, olives and pickles in glass jars, golden midday light through a small doorway."
gen restaurants gracia-verde 16:9 "$STYLE_COVER A bright plant-based restaurant in Barcelona's Gracia neighbourhood with whitewashed walls, hanging plants, a wooden communal table set with colourful vegetable bowls and morning sun through tall shutters."
gen restaurants arroces-del-turia 16:9 "$STYLE_COVER A family paella restaurant in Valencia: an outdoor wood fire of orange-tree branches under wide paella pans, a whitewashed courtyard, long tables with checked cloths and citrus trees at the edge of the frame."
gen restaurants taqueria-ruzafa 16:9 "$STYLE_COVER A small, noisy taqueria in Valencia's Ruzafa district with an open kitchen, a hand press making corn tortillas, bowls of three salsas in different reds, papel picado without any writing and a tall stool counter."
gen restaurants cafe-de-les-arts 16:9 "$STYLE_COVER A specialty coffee shop in Valencia at brunch time: a La Marzocco style espresso machine, sourdough toast with avocado on the counter, potted plants, laptops and a dog resting under a table by the window."
gen restaurants taberna-el-arenal 16:9 "$STYLE_COVER A century-old tavern in Seville with hand-painted ceramic tiles up to shoulder height, whole cured hams hanging from the ceiling, a dark wooden bar with small montaditos on plates and glasses of pale manzanilla sherry."
gen restaurants asador-triana 16:9 "$STYLE_COVER A riverside grill restaurant in Seville's Triana district at golden hour: a terrace over the Guadalquivir river with the Torre del Oro softly out of focus across the water, a thick bone-in steak on a wooden board and glowing oak embers."
gen restaurants bao-house-alameda 16:9 "$STYLE_COVER A modern bao and ramen bar in Seville with an open kitchen full of bamboo steamers releasing steam, long shared wooden tables, neon-free industrial lamps and a queue of blurred figures seen through the front glass."

# ---------- Platos (4:3) ----------
gen dishes cocido-madrileno 4:3 "$STYLE_DISH Madrid cocido served in its second course: chickpeas, cabbage, carrot, potato, chorizo, morcilla and tender beef arranged on a wide ceramic platter, with a small bowl of noodle broth beside it."
gen dishes nigiri-toro 4:3 "$STYLE_DISH Two pieces of fatty tuna nigiri on a dark slate, the marbled toro glistening with a light brush of soy, a small mound of pickled ginger and a wooden chopstick rest."
gen dishes bravas 4:3 "$STYLE_DISH Crispy patatas bravas in a small terracotta dish, drizzled with a bright red spicy sauce and a dark black-garlic aioli, a wooden toothpick resting on the edge."
gen dishes arroz-negro 4:3 "$STYLE_DISH Black squid-ink rice in a shallow steel paella pan, pieces of cuttlefish and a few prawns on top, a dollop of aioli on the side and a lemon wedge, sea light from a window."
gen dishes vermut 4:3 "$STYLE_DISH A glass of red vermouth on ice with an orange slice and a green olive on a stick, next to an open tin of anchovies and a small plate of potato chips on a barrel top."
gen dishes bowl-quinoa 4:3 "$STYLE_DISH A vegan bowl of quinoa, roasted pumpkin cubes, pomegranate seeds, baby spinach and a tahini drizzle in a hand-thrown stoneware bowl, sesame seeds scattered on top."
gen dishes paella-valenciana 4:3 "$STYLE_DISH An authentic Valencian paella straight from the wood fire: golden saffron rice with chicken, rabbit, flat green beans and garrofo beans, a rosemary sprig, seen from above in a wide blackened pan."
gen dishes taco-cochinita 4:3 "$STYLE_DISH Three cochinita pibil tacos on soft corn tortillas, shredded orange-red pork topped with pickled purple onion and a habanero slice, on a wooden board with lime halves."
gen dishes huevos-benedictinos 4:3 "$STYLE_DISH Eggs Benedict with smoked salmon on toasted sourdough, hollandaise sauce dripping over a poached egg cut open to show the yolk, chives on top, a flat white beside it."
gen dishes montadito-pringa 4:3 "$STYLE_DISH A small pringa montadito in a crusty telera roll, the slow-cooked meat mixture visible at the edge, on a small white plate on a dark wooden bar next to a glass of manzanilla sherry."
gen dishes chuleton 4:3 "$STYLE_DISH A thick dry-aged bone-in rib steak sliced on a wooden board, charred crust and rosy pink interior, flakes of salt and a few blistered Padron peppers, embers glowing softly in the background."
gen dishes bao-panceta 4:3 "$STYLE_DISH Two fluffy white steamed bao buns filled with glazed pork belly, pickled cucumber, crushed peanuts and coriander, in a bamboo steamer lined with parchment."

echo "DONE"
ls "$OUT/restaurants" "$OUT/dishes"
