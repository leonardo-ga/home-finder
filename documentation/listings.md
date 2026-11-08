# Catalogue sources

The catalogue contains eight selected listings. All eight live Immobiliare.it pages were read in the browser on **8 November 2026** to recheck rent, fees, deposits, area, rooms, bathrooms, floor, energy class, elevator, outdoor space and description. Search results were found to contain superseded prices and must not override the live pages. This is a static snapshot, not a live feed.

| Listing                                                    | Address                                 | Monthly rent | Monthly condominium fees | Area  | Published latitude | Published longitude |
| ---------------------------------------------------------- | --------------------------------------- | ------------ | ------------------------ | ----- | ------------------ | ------------------- |
| [133551500](https://www.immobiliare.it/annunci/133551500/) | Via Ruggero di Lauria 20, Milano        | €685         | €65                      | 45 m² | 45.4866            | 9.1565              |
| [134409133](https://www.immobiliare.it/annunci/134409133/) | Via Piero della Francesca 58, Milano    | €700         | €200                     | 48 m² | 45.4856            | 9.1614              |
| [134021467](https://www.immobiliare.it/annunci/134021467/) | Via Domenico Cirillo 14, Milano         | €920         | €80                      | 50 m² | 45.4776            | 9.1722              |
| [132198580](https://www.immobiliare.it/annunci/132198580/) | Via Enrico Cosenz 13, Milano            | €800         | €200                     | 55 m² | 45.5074            | 9.16557             |
| [132703154](https://www.immobiliare.it/annunci/132703154/) | Via Bovisasca, Milano                   | €750         | €50                      | 50 m² | 45.5046            | 9.1604              |
| [130146018](https://www.immobiliare.it/annunci/130146018/) | Via Giovanni Rasori, Milano             | €800         | €150                     | 39 m² | 45.4678            | 9.16151             |
| [133519316](https://www.immobiliare.it/annunci/133519316/) | Via Domenico Cucchiari 15, Milano       | €750         | €123                     | 40 m² | 45.4892            | 9.1659              |
| [130761760](https://www.immobiliare.it/annunci/130761760/) | Via Giulio Cesare Procaccini 73, Milano | EUR 865      | EUR 135                  | 39 m2 | 45.480737          | 9.166608            |

Cirillo, Cosenz, Cucchiari, and Procaccini have elevators. The other four listings do not. Piero della Francesca and Cosenz advertise private balconies. Cirillo describes a shared access balcony, which is not recorded as private outdoor space. Cucchiari does not specify private outdoor space.

## Source inconsistencies

Deposits are recorded only where the verified listing provided them: Ruggero di Lauria €2,055, Piero della Francesca €2,100, Cirillo €2,760, and Cucchiari three monthly rents (€2,250 calculated). The remaining deposits and all agency commissions remain unquantified. The modal shows the deposit once as a one-off amount and does not derive a combined initial payment.

- **Cosenz:** the live structured fields show €800 rent and €200 fees, while the description states €850 and €150. Both total €1,000. The catalogue uses the structured fields and flags the split for confirmation. Cached search results showed older amounts and were not used.
- **Cucchiari:** the features round the area to 40 m², the description says 39 m², and the surface breakdown gives 39.6 m². The catalogue uses the 40 m² headline value and records the discrepancy. Furnishing also needs confirmation: the structured field says only the kitchen is furnished, but the description mentions bedroom furniture. The €123 fees are an estimate subject to reconciliation.
- **Bovisasca and Rasori:** no street number is published. Their catalogue addresses intentionally omit a house number and use the listing's map pin.

The original seven pins use the coordinates supplied by Immobiliare.it, not geocoder street centres. Published pins may still be approximate; verify the actual entrance during a visit.

The cover images are linked directly from the listing's published metadata:

- [Via Ruggero di Lauria — living room](https://pwm.im-cdn.it/image/2029010156/cover-m-c.jpg)
- [Via Piero della Francesca — facade](https://pwm.im-cdn.it/image/2049132015/cover-m-c.jpg)
- [Via Domenico Cirillo — building interior](https://pwm.im-cdn.it/image/2039954519/cover-m-c.jpg)
- [Via Enrico Cosenz — living room](https://pwm.im-cdn.it/image/1999221884/cover-m-c.jpg)
- [Via Bovisasca — living room](https://pwm.im-cdn.it/image/2010487890/cover-m-c.jpg)
- [Via Giovanni Rasori — facade](https://pwm.im-cdn.it/image/1950906454/cover-m-c.jpg)
- [Via Domenico Cucchiari — bedroom](https://pwm.im-cdn.it/image/2028309162/cover-m-c.jpg)

All eight catalogue image URLs returned HTTP 200 with content type `image/jpeg` on 8 November 2026. The original seven image and pin metadata values were obtained on 7 November; their coordinates were not independently surveyed during this recheck. Images remain hosted by their original provider and may change or become unavailable; the catalogue falls back to its placeholder when an image fails. Notes summarize listing facts and retain the original listing link.

The records live in `src/app/features/homes/domain/home.catalogue.ts`, the sole data source for the website. All visitors see these source-controlled records. The application does not save or load browser data and has no editing or backup controls. Updating the catalogue requires editing this file and deploying a new build.

## Procaccini: original source takes precedence

The live [Immobiliare.it 130761760](https://www.immobiliare.it/annunci/130761760/) page was read in the browser on 8 November 2026. It shows EUR 865/month, reduced from EUR 1,000 (-13.5%), and **EUR 135/month condominium fees**. The known monthly total is **EUR 1,000**, and the deposit is not specified. The page states it was updated on 30 October 2026.

The matching [Attico.it listing](https://www.attico.it/immobile-appartamento-lombardia-milano-54438518/) still reports EUR 134 in both the rendered condominium-fee field and its structured data. This is a real source discrepancy, not a calculation or rounding decision. The catalogue now uses the original Immobiliare.it value of EUR 135 and flags the discrepancy for agency confirmation. [Wikicasa](https://www.wikicasa.it/annuncio/31266420) links the same external listing ID 130761760 and agency reference W-04AP42, but does not independently confirm the condominium charge. The earlier EUR 999 total derived from Attico.it has been corrected.

The photo and pin remain from the matching Attico.it property metadata: [cover photo](https://images-1.casa.it/655x483/listing/0/c0/15/12/818050089.jpg), latitude 45.480737, longitude 9.166608. These are published coordinates, not a verified entrance. The image returned HTTP 200, image/jpeg.

## Characteristics rechecked in the live pages

All eight advertise one bathroom. The remaining structured fields match the catalogue:

| Home                  | Area (m2)   | Rooms | Floor | Elevator | Energy | Private outdoor space          |
| --------------------- | ----------- | ----- | ----- | -------- | ------ | ------------------------------ |
| Ruggero di Lauria     | 45          | 2     | 1     | No       | G      | No balcony or terrace          |
| Piero della Francesca | 48          | 1     | 1     | No       | F      | Balcony                        |
| Cirillo               | 50          | 1     | 1     | Yes      | G      | No; shared access balcony only |
| Cosenz                | 55          | 2     | 3     | Yes      | E      | Balcony                        |
| Bovisasca             | 50          | 2     | 1     | No       | G      | No balcony or terrace          |
| Rasori                | 39          | 2     | 3     | No       | G      | No balcony or terrace          |
| Cucchiari             | 40 headline | 1     | 6     | Yes      | G      | Not specified                  |
| Procaccini            | 39          | 1     | 2     | Yes      | D      | No balcony or terrace          |

Cosenz still has conflicting fields (EUR 800 + EUR 200) and description (EUR 850 + EUR 150), both totalling EUR 1,000. Its current description explicitly includes water and condominium charges, and excludes electricity, gas, heating, internet and TARI. Its structured contract says free-market while the description specifies a temporary 6-18 month contract requiring a reason and without automatic renewal; confirm the contract with the advertiser. Older indexed results mentioning EUR 1,050 + EUR 150, class A3 and a terrace do not describe the current live fields.

Bovisasca is EUR 750 + EUR 50 on the live page; indexed EUR 850 rent is superseded. Cucchiari still has the documented area/furnishing discrepancy and estimated fees subject to reconciliation. Its three-month deposit is stated in the description even though the structured deposit field is unspecified. Unknown deposits and agency fees remain unknown.
