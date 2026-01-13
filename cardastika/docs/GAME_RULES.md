# cardastika - Game Rules

## Overview
cardastika is a turn-based card dueling game where players build a deck of 9 cards with different elemental powers and battle against an AI opponent.

## Game Mechanics

### Deck Building
- Players must select exactly **9 cards** to form their battle deck
- Cards have different **elements**: Fire, Water, Earth, Air, Lightning, Ice
- Each card has two stats:
  - **Attack** (⚔️): Offensive power
  - **Defense** (🛡️): Defensive capability

### Elements and Effectiveness
Elements follow a circular effectiveness pattern:

```
Fire → Ice (1.5x)
Ice → Lightning (1.5x)
Lightning → Air (1.5x)
Air → Earth (1.5x)
Earth → Water (1.5x)
Water → Fire (1.5x)
```

**Multipliers:**
- Effective attack: **1.5x damage**
- Weak attack: **0.5x damage**
- Neutral attack: **1.0x damage**

### Battle System

#### Starting Conditions
- Both players start with **100 HP**
- Both decks are shuffled at the start

#### Turn Flow
1. **Player Turn**: Select a card from your deck
2. **Enemy Turn**: AI automatically selects a card
3. **Resolution**: 
   - Both cards attack simultaneously
   - Damage is calculated using the formula:
     ```
     Damage = (Attack - Defense/2) × ElementMultiplier
     ```
   - Higher damage wins the round
   - Winner's net damage is dealt to the opponent's HP
4. **Card Removal**: Used cards are removed from both decks
5. **Round End**: Check win conditions

#### Win Conditions
- **Victory**: Reduce opponent's HP to 0 or below
- **Defeat**: Your HP reaches 0 or below
- **Draw**: Both players reach 0 HP simultaneously, or all cards used with equal HP

### Damage Calculation Example

**Scenario**: Fire Dragon (Attack 45) vs Water Spirit (Defense 40)

```
Base Damage = 45 - (40 / 2) = 45 - 20 = 25
Element Multiplier = Fire vs Water = 0.5 (weak)
Final Damage = 25 × 0.5 = 12.5 → 13 damage (rounded)
```

**Scenario**: Water Spirit (Attack 35) vs Fire Dragon (Defense 30)

```
Base Damage = 35 - (30 / 2) = 35 - 15 = 20
Element Multiplier = Water vs Fire = 1.5 (effective)
Final Damage = 20 × 1.5 = 30 damage
```

**Result**: Water Spirit wins this round, dealing 30 - 13 = **17 net damage** to opponent.

## Strategy Tips

### Deck Building
- **Balance**: Mix elements to counter different opponents
- **Synergy**: Consider high attack cards for offense, high defense for survival
- **Element Coverage**: Don't rely on just one element

### Battle
- **Element Advantage**: Choose cards that are effective against opponent's cards
- **Card Management**: Save powerful cards for crucial moments
- **Risk Assessment**: Sometimes a defensive card is better than aggressive play

## Card Stats Range
- **Attack**: 30-50
- **Defense**: 25-50
- **Total Power**: Typically 65-90 per card

## Auto-Play Feature
- AI can play for you automatically
- Useful for testing or quick battles
- Selects cards randomly (not optimized)

## Game Modes

### Current (MVP)
- Single player vs AI
- Random AI opponent deck
- 9-card deck battles

### Future Possibilities
- Multiplayer battles
- Tournament mode
- Card collection and unlocking
- Deck themes and special abilities
- Power-ups and special moves

## Technical Notes

### Balancing
- Element effectiveness creates strategic depth
- Defense reduces damage but doesn't negate it completely
- Random card selection keeps games unpredictable
- Both players use same rules for fairness

### AI Behavior
- Currently selects cards randomly
- Future: Smart AI that considers element effectiveness
- Future: Difficulty levels (Easy, Normal, Hard)

## Credits
Game Design: cardastika Team
Version: 1.0.0 (MVP)
Last Updated: January 2026
