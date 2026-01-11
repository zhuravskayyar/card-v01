// Steampunk Elements multipliers and damage helper (global)
(function(){
  window.ELEMENTS = ["fire","water","air","earth"];
  window.MULT = {
    fire:  { fire:1.0, water:0.5, air:1.5, earth:1.0 },
    water: { fire:1.5, water:1.0, air:1.0, earth:0.5 },
    air:   { fire:0.5, water:1.0, air:1.0, earth:1.5 },
    earth: { fire:1.0, water:1.5, air:0.5, earth:1.0 }
  };
  window.damage = function(attackerCard, defenderCard){
    const m = (window.MULT[attackerCard.element]||{})[defenderCard.element];
    const mult = typeof m === 'number' ? m : 1.0;
    const p = attackerCard.power || 0;
    const dmg = Math.round(p * mult);
    return { dmg, mult };
  };
})();
