# Catalogue sources

The catalogue contains the seven listings selected by the repository owner. Prices, fees, characteristics, cover-photo URLs, and map coordinates were checked against the listings and their published page metadata on **7 November 2026**. They are a static snapshot, not a live feed.

| Listing                                                    | Address                              | Monthly rent | Monthly condominium fees | Area  | Published latitude | Published longitude |
| ---------------------------------------------------------- | ------------------------------------ | ------------ | ------------------------ | ----- | ------------------ | ------------------- |
| [133551500](https://www.immobiliare.it/annunci/133551500/) | Via Ruggero di Lauria 20, Milano     | €685         | €65                      | 45 m² | 45.4866            | 9.1565              |
| [134409133](https://www.immobiliare.it/annunci/134409133/) | Via Piero della Francesca 58, Milano | €700         | €200                     | 48 m² | 45.4856            | 9.1614              |
| [134021467](https://www.immobiliare.it/annunci/134021467/) | Via Domenico Cirillo 14, Milano      | €920         | €80                      | 50 m² | 45.4776            | 9.1722              |
| [132198580](https://www.immobiliare.it/annunci/132198580/) | Via Enrico Cosenz 13, Milano         | €800         | €200                     | 55 m² | 45.5074            | 9.16557             |
| [132703154](https://www.immobiliare.it/annunci/132703154/) | Via Bovisasca, Milano                | €750         | €50                      | 50 m² | 45.5046            | 9.1604              |
| [130146018](https://www.immobiliare.it/annunci/130146018/) | Via Giovanni Rasori, Milano          | €800         | €150                     | 39 m² | 45.4678            | 9.16151             |
| [133519316](https://www.immobiliare.it/annunci/133519316/) | Via Domenico Cucchiari 15, Milano    | €750         | €123                     | 40 m² | 45.4892            | 9.1659              |

Cirillo, Cosenz, and Cucchiari have elevators. The other four listings do not. Piero della Francesca and Cosenz advertise private balconies. Cirillo describes a shared access balcony, which is not recorded as private outdoor space. Cucchiari does not specify private outdoor space.

## Source inconsistencies

Deposits are recorded only where the verified listing provided them: Ruggero di Lauria €2,055, Piero della Francesca €2,100, Cirillo €2,760, and Cucchiari three monthly rents (€2,250 calculated). The remaining deposits and all agency commissions remain unquantified. The modal shows the deposit once as a one-off amount and does not derive a combined initial payment.

- **Cosenz:** the live structured fields show €800 rent and €200 fees, while the description states €850 and €150. Both total €1,000. The catalogue uses the structured fields and flags the split for confirmation. Cached search results showed older amounts and were not used.
- **Cucchiari:** the features round the area to 40 m², the description says 39 m², and the surface breakdown gives 39.6 m². The catalogue uses the 40 m² headline value and records the discrepancy. Furnishing also needs confirmation: the structured field says only the kitchen is furnished, but the description mentions bedroom furniture. The €123 fees are an estimate subject to reconciliation.
- **Bovisasca and Rasori:** no street number is published. Their catalogue addresses intentionally omit a house number and use the listing's map pin.

Pins use the coordinates supplied by Immobiliare.it, not geocoder street centres. Published pins may still be approximate; verify the actual entrance during a visit.

The cover images are linked directly from the listing's published metadata:

- [Via Ruggero di Lauria — living room](https://pwm.im-cdn.it/image/2029010156/cover-m-c.jpg)
- [Via Piero della Francesca — facade](https://pwm.im-cdn.it/image/2049132015/cover-m-c.jpg)
- [Via Domenico Cirillo — building interior](https://pwm.im-cdn.it/image/2039954519/cover-m-c.jpg)
- [Via Enrico Cosenz — living room](https://pwm.im-cdn.it/image/1999221884/cover-m-c.jpg)
- [Via Bovisasca — living room](https://pwm.im-cdn.it/image/2010487890/cover-m-c.jpg)
- [Via Giovanni Rasori — facade](https://pwm.im-cdn.it/image/1950906454/cover-m-c.jpg)
- [Via Domenico Cucchiari — bedroom](https://pwm.im-cdn.it/image/2028309162/cover-m-c.jpg)

Each image URL returned HTTP 200 with content type `image/jpeg` during verification. Images remain hosted by their original provider and may change or become unavailable; the catalogue falls back to its placeholder when an image fails. Notes summarize listing facts and retain the original listing link.

The records live in `src/app/features/homes/domain/home.catalogue.ts`, the sole data source for the website. All visitors see these source-controlled records. The application does not save or load browser data and has no editing or backup controls. Updating the catalogue requires editing this file and deploying a new build.
