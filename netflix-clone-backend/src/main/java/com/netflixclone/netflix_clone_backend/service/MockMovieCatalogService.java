package com.netflixclone.netflix_clone_backend.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class MockMovieCatalogService {

    private static final List<Map<String, Object>> CATALOG = List.of(
            movie(1, "Neon District", "A runaway coder exposes a citywide surveillance grid.", "2024-05-03", 7.8, "movie"),
            movie(2, "Polar Night", "A rescue team races against a whiteout storm in the Arctic.", "2023-11-18", 8.1, "movie"),
            movie(3, "Glass Circuit", "An AI tribunal decides the fate of humanity.", "2025-01-10", 7.6, "tv"),
            movie(4, "Urban Echo", "A detective hunts signals hidden in city noise.", "2022-09-22", 7.2, "movie"),
            movie(5, "Last Frequency", "A pirate radio host sparks a rebellion.", "2024-02-14", 8.4, "tv"),
            movie(6, "Skyline Zero", "Disaster engineers fight to save a collapsing megacity.", "2021-07-08", 7.4, "movie"),
            movie(7, "Crimson Tidewall", "Coastal survivors defend the final sea barrier.", "2024-08-30", 7.9, "movie"),
            movie(8, "Quantum Drift", "A pilot slips between timelines on every mission.", "2023-03-27", 8.0, "tv"),
            movie(9, "Midnight Atlas", "Cartographers map forbidden zones after dark.", "2022-01-19", 7.1, "movie"),
            movie(10, "Broken Comet", "A family survives as debris storms hit Earth orbit.", "2025-04-11", 8.3, "movie"),
            movie(11, "Silk & Steel", "Two rival dynasties clash over a vertical kingdom.", "2021-12-02", 7.0, "tv"),
            movie(12, "Static River", "A forgotten town wakes each night to a strange broadcast.", "2023-06-25", 7.7, "movie")
    );

    public List<Map<String, Object>> trending() {
        return randomized(10);
    }

    public List<Map<String, Object>> topRated() {
        List<Map<String, Object>> sorted = new ArrayList<>(CATALOG);
        sorted.sort((a, b) -> Double.compare((double) b.get("vote_average"), (double) a.get("vote_average")));
        return sorted.subList(0, Math.min(10, sorted.size()));
    }

    public List<Map<String, Object>> netflixOriginals() {
        List<Map<String, Object>> series = new ArrayList<>();
        for (Map<String, Object> item : CATALOG) {
            if ("tv".equals(item.get("media_type"))) {
                series.add(item);
            }
        }
        return series.isEmpty() ? randomized(8) : series;
    }

    public List<Map<String, Object>> action() {
        return randomized(10);
    }

    public List<Map<String, Object>> comedy() {
        return pickByIds(List.of(1, 4, 9, 11, 12), 8);
    }

    public List<Map<String, Object>> horror() {
        return pickByIds(List.of(2, 5, 7, 10, 12), 8);
    }

    public List<Map<String, Object>> romance() {
        return pickByIds(List.of(3, 6, 8, 9, 11), 8);
    }

    public List<Map<String, Object>> documentaries() {
        return pickByIds(List.of(2, 4, 6, 8, 10), 8);
    }

    public List<Map<String, Object>> premiumPicks() {
        return pickByIds(List.of(3, 5, 7, 8, 10), 8);
    }

    private List<Map<String, Object>> randomized(int limit) {
        List<Map<String, Object>> copy = new ArrayList<>(CATALOG);
        Collections.shuffle(copy);
        return copy.subList(0, Math.min(limit, copy.size()));
    }

    private List<Map<String, Object>> pickByIds(List<Integer> ids, int limit) {
        List<Map<String, Object>> selected = new ArrayList<>();
        for (Map<String, Object> item : CATALOG) {
            Object idValue = item.get("id");
            if (idValue instanceof Integer && ids.contains((Integer) idValue)) {
                selected.add(item);
            }
        }
        if (selected.isEmpty()) {
            return randomized(limit);
        }
        Collections.shuffle(selected);
        return selected.subList(0, Math.min(limit, selected.size()));
    }

    private static Map<String, Object> movie(
            int id,
            String title,
            String overview,
            String releaseDate,
            double rating,
            String mediaType
    ) {
        String image = "https://picsum.photos/seed/netflix-" + id + "/1280/720";
        return Map.of(
                "id", id,
                "title", title,
                "name", title,
                "overview", overview,
                "release_date", releaseDate,
                "first_air_date", releaseDate,
                "vote_average", rating,
                "media_type", mediaType,
                "backdrop_path", image,
                "poster_path", image
        );
    }
}
