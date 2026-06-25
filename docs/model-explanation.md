# Prediction model

## Ratings and expected goals

Every team has an illustrative Elo, attack, and defense rating. Neutral-site expected goals begin at 1.28 and are multiplied by an exponential Elo factor, the attacking team's attack factor, and the opponent's inverse defense factor. Values are clamped from 0.2 to 3.8 to avoid unrealistic tails.

## Poisson scores

Each side's goals are sampled independently from its Poisson distribution. `predict_match` enumerates scorelines from 0–8 to estimate win/draw/loss probabilities and the most likely score. Knockout draws use a rating-weighted seeded penalty decision.

## Monte Carlo

Each run simulates all 72 group matches and matches 73–104. Counters track group wins, qualification, stage reaches, and champions. Probabilities are counts divided by runs; the endpoint accepts 100–10,000 runs and returns the effective seed.

## Limitations

The model excludes current injuries, lineups, tactics, travel, venue effects, and live form. Ratings are educational seed values. Independent Poisson goals simplify score dependence, and model probabilities are not guarantees.

