const TMDB = "https://image.tmdb.org/t/p/w500";

export const MOVIE_LIBRARY_CATEGORIES = [
  {
    id: "feature",
    eyebrow: "Theatrical",
    title: "Feature Films",
    description: "Blockbuster features and franchise tentpoles delivered at studio scale.",
    movies: [
      { id: "spiderman", title: "Spider-Man", year: "2021", image: "/cards/spiderman.jpg" },
      { id: "aquaman", title: "Aquaman", year: "2018", image: "/cards/aquaman.jpg" },
      { id: "dune", title: "Dune", year: "2021", image: "/cards/dune.jpg" },
      { id: "avatar", title: "Avatar", year: "2022", image: "/cards/avatar.jpg" },
      { id: "oppenheimer", title: "Oppenheimer", year: "2023", image: "/cards/oppenheimer.jpg" },
      { id: "interstellar", title: "Interstellar", year: "2014", image: "/cards/interstellar.jpg" },
      { id: "blackpanther", title: "Black Panther", year: "2018", image: "/cards/blackpanther.jpg" },
      { id: "1917", title: "1917", year: "2019", image: "/cards/1917movie.jpg" },
      { id: "matrix", title: "The Matrix", year: "2021", image: "/cards/matrix.jpg" },
      { id: "blade-runner", title: "Blade Runner 2049", year: "2017", image: "/cards/blade-runner.jpg" },
    ],
  },
  {
    id: "commercial",
    eyebrow: "Branded Content",
    title: "Commercial",
    description: "High-end spots and branded films for global campaigns.",
    movies: [
      { id: "inception", title: "Inception — Brand Film", year: "2010", image: `${TMDB}/oYuLEt3zVCKq57qu2F8dT7NIk6q.jpg` },
      { id: "gravity", title: "Gravity — Spot Campaign", year: "2013", image: `${TMDB}/tSG98mNjK5n3rFhmqbF40DUrz2y.jpg` },
      { id: "life-of-pi", title: "Life of Pi — VFX Spot", year: "2012", image: `${TMDB}/hggH2vbcrjXP1yMwp9fu9TmHHtr.jpg` },
      { id: "mad-max", title: "Mad Max — Action Spot", year: "2015", image: `${TMDB}/8h9Oy62cAyutsP2h5dxrJh92QY7.jpg` },
      { id: "lion-king", title: "The Lion King — Campaign", year: "2019", image: `${TMDB}/2bXbqYdUdNVa47PLYzBOYO2wpFK.jpg` },
      { id: "tenet", title: "Tenet — Launch Film", year: "2020", image: `${TMDB}/k68n0b97UfGAb9fVqFWLpB4zLIS.jpg` },
      { id: "ford-v-ferrari", title: "Ford v Ferrari — Spot", year: "2019", image: `${TMDB}/zrK3vQd6l7cEaK4gX8Tictr8ZM5.jpg` },
      { id: "top-gun", title: "Top Gun: Maverick — Spot", year: "2022", image: `${TMDB}/62HCnUMx61VMbDg4d6Oo1LekE9.jpg` },
      { id: "interstellar-ad", title: "Interstellar — Brand Film", year: "2014", image: `${TMDB}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg` },
      { id: "dune-ad", title: "Dune — Launch Campaign", year: "2021", image: `${TMDB}/d5NX3WyR8pxWjCQHKwcYsrqyUv4.jpg` },
    ],
  },
  {
    id: "domestic",
    eyebrow: "Indian Cinema",
    title: "Domestic — Telugu",
    description: "Telugu blockbusters and pan-India epics from the south.",
    movies: [
      { id: "rrr", title: "RRR", year: "2022", image: `${TMDB}/7gKI9pzEMJNYUmdUetaXK.jpg` },
      { id: "baahubali-1", title: "Baahubali: The Beginning", year: "2015", image: `${TMDB}/2rO0870jbb8Zaj5PRMXN6xYPUoB.jpg` },
      { id: "baahubali-2", title: "Baahubali 2: The Conclusion", year: "2017", image: `${TMDB}/itzRlekIVkRdvefCwWTFjm0or6J.jpg` },
      { id: "pushpa", title: "Pushpa: The Rise", year: "2021", image: `${TMDB}/4hHb4k4d9z3X6VgLd6Z2oCOlq20.jpg` },
      { id: "kgf-1", title: "KGF: Chapter 1", year: "2018", image: `${TMDB}/oQQMb93PBw9jWVJIPjA1G2lM528.jpg` },
      { id: "kgf-2", title: "KGF: Chapter 2", year: "2022", image: `${TMDB}/4ee24j2g6e3WNiXiN1z6xaYWY8D.jpg` },
      { id: "magadheera", title: "Magadheera", year: "2009", image: `${TMDB}/b5HEoF7c9gXblY3Vx2n9_szb5yH.jpg` },
      { id: "rangasthalam", title: "Rangasthalam", year: "2018", image: `${TMDB}/A9w0N65bRxm6X2YQc9A7KJJ5KJj.jpg` },
      { id: "avpl", title: "Ala Vaikunthapurramuloo", year: "2020", image: `${TMDB}/yN3IOc0G1kPszgZysN9r3Q2rzxP.jpg` },
      { id: "arjun-reddy", title: "Arjun Reddy", year: "2017", image: `${TMDB}/8zZbXRMWHmIMezw6SN6qaG9b2R6.jpg` },
    ],
  },
];

export const MOVIE_LIBRARY_PANELS = MOVIE_LIBRARY_CATEGORIES.map((category) => ({
  type: "category",
  key: category.id,
  category,
}));
