# Instagram Portfolio Analysis — @denailss_9

Scraped from `https://www.instagram.com/denailss_9/` (full profile history) and classified per-post
using the site's own gallery taxonomy. Raw data lives in `scrap-ig-denails/data.json`; every post
carries an `analysis` object with `style`, `warna`, `acara`, `bentuk`, `difficulty` — exactly the
enum values used by `src/types` and `src/features/gallery/constants.ts`.

## Dataset

- **Total posts**: 181 (all profile history, including reels and mixed carousels)
- **Media**: 618 images + 175 videos (793 files, ~123 MB) under `scrap-ig-denails/images/`
- **Captions**: 21 posts with captions, 160 without
- **Comments**: 15 accessible comments across 14 posts
- **Media type breakdown**: carousel 162, image 18, video 1

## Classification method

Each post was classified from its first image using vision analysis against the site's controlled
vocabulary. The 1 video-only post (`DDYdNS2y1wo`) was classified from an extracted video frame.
Carousel posts are classified once (from the cover image); all slides of a post share that post's
analysis.

## Distribution

### Style

| Value | Label | Posts |
|---|---|---|
| 3d-art | 3D Art | 71 |
| chrome | Chrome | 32 |
| french | French | 29 |
| minimalist | Minimalis | 27 |
| korean | Korean | 12 |
| ombre | Ombre | 10 |

### Warna (dominant color)

| Value | Label | Posts |
|---|---|---|
| red | Merah | 51 |
| pink | Pink | 46 |
| nude | Nude | 34 |
| pastel | Pastel | 20 |
| black | Hitam | 15 |
| gold | Gold | 8 |
| white | Putih | 7 |

### Acara (occasion)

| Value | Label | Posts |
|---|---|---|
| party | Party | 122 |
| daily | Harian | 45 |
| wedding | Wedding | 9 |
| festive | Festive | 5 |

### Bentuk (nail shape)

| Value | Label | Posts |
|---|---|---|
| almond | Almond | 163 |
| round | Round | 15 |
| coffin | Coffin | 1 |
| stiletto | Stiletto | 1 |
| square | Square | 1 |

### Tingkat kesulitan (difficulty)

| Value | Label | Posts |
|---|---|---|
| complex | Rumit | 95 |
| medium | Sedang | 61 |
| easy | Mudah | 15 |
| very-complex | Sangat Rumit | 10 |

## Sample entry

```json
{
  "id": "3960517082697927782",
  "shortcode": "Db2lU2RE4xm",
  "url": "https://www.instagram.com/p/Db2lU2RE4xm/",
  "media_type": "carousel",
  "analysis": {
    "style": "ombre",
    "warna": "red",
    "acara": "party",
    "bentuk": "almond",
    "difficulty": "medium"
  }
}
```

## Notes

- Like counts are `null` on most posts (the profile disables like/view counts); only 4 posts expose
  real counts (2, 3, 9, 2).
- `graduation` (Wisuda) is part of the taxonomy but none of the 181 posts were classified as such.
- The analysis feeds gallery curation: the seeding script
  (`scripts/seed-gallery.ts`) uses these values directly as the gallery design taxonomy.
