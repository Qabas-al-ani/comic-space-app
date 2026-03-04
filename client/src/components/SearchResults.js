import axios from "axios";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { SAVE_COMIC, WISH_COMIC } from "../utils/mutations";
import Auth from "../utils/auth";
import React from "react";
import Flippy, { FrontSide, BackSide } from "react-flippy";
// import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
// import CssBaseline from "@mui/material/CssBaseline";
// import Card from "@mui/material/Card";
import Pagination from "@mui/material/Pagination";
// import Cards from "../components/Cards";
import Shadow from "../components/Shadow";
import { useAlert } from "react-alert";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { QUERY_ME } from "../utils/queries";

const cardStyle = {
  frontSide: {
    backgroundColor: "#531c28",
    border: "2px solid #e50914",
    borderRadius: "5px",
    boxShadow: "3px 3px 4px grey",
    height: "100%",
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  backSide: {
    color: "#000",
    backgroundColor: "#d7c5b7",
    overflowX: "auto",
    padding: "12px",
    fontSize: "14px",
  },
};
const imgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};
const cardCaptionStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
  color: "#e50914",
  padding: "12px 10px 10px",
  fontFamily: "Bangers, cursive",
  letterSpacing: "1px",
};
const cardCaptionTitle = { fontSize: "1.1rem", margin: 0, color: "#fff" };
const cardCaptionSub = { fontSize: "0.75rem", margin: "4px 0 0", color: "rgba(255,255,255,0.9)" };

// In production, REST API (e.g. /api/superhero/search) lives on Render; in dev, use proxy
const graphqlUri =
  process.env.REACT_APP_GRAPHQL_URI ||
  (process.env.NODE_ENV === "production"
    ? "https://comic-space-api.onrender.com/graphql"
    : "http://localhost:3001/graphql");
const apiBase =
  process.env.NODE_ENV === "production"
    ? graphqlUri.replace(/\/graphql\/?$/, "")
    : "";

const Tester = () => {
  const [character, setCharacter] = useState("");
  const [comics, setComics] = useState([]);
  let buttons = [];
  const [test, setTest] = useState([]);
  const alert = useAlert();
  const [autos, setAutos] = useState([]);
  let startsWith = [];

  const [saveComic] = useMutation(SAVE_COMIC);
  const [wishComic] = useMutation(WISH_COMIC);
  const { loading, data } = useQuery(QUERY_ME);
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const userData = data?.me || [];
  let shadowArray = [];

  React.useEffect(() => {
    if (!loading) {
      setCollection([...userData.comics]);
      setWishlist([...userData.wishlist]);
    }
  }, [userData]);

  const handleComicSave = async (comicId) => {
    const comicToSave = comics.find((comic) => comic.comicId === comicId);

    console.log(comicToSave);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }
    // Add the input for the mutation save_book in a variable object set to bookToSave
    try {
      await saveComic({
        variables: { input: comicToSave },
      });
    } catch (err) {
      console.error(err);
    }
  };
  // Wishlish function to add to comic Wishlist in profile
  const handleComicWish = async (comicId) => {
    const comicToWish = comics.find((comic) => comic.comicId === comicId);

    console.log(comicToWish);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }
    // Add the input for the mutation save_book in a variable object set to bookToSave
    try {
      await wishComic({
        variables: { input: comicToWish },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const createAutoComplete = async () => {
    if (character.length >= 2) {
      try {
        const returnedValue = await axios.get(
          `${apiBase}/api/superhero/suggest`,
          { params: { q: character } }
        );
        const results = returnedValue.data?.data?.results || [];
        if (results.length > 0) {
          startsWith = results.map((auto) => auto.name);
          setAutos([...startsWith]);
        }
      } catch (err) {
        setAutos([]);
      }
    } else {
      setAutos([]);
      startsWith = [];
    }
  };

  const next = async (offset) => {
    const response = await axios.get(`${apiBase}/api/superhero/search`, {
      params: { q: character, offset, limit: 20 },
    });
    setResponse(response);
  };

  const search = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/superhero/search`, {
        params: { q: character, offset: 0, limit: 20 },
      });
      return response;
    } catch (err) {
      console.error("Search error:", err);
      return undefined;
    }
  };

  const setResponse = (response) => {
    const results = response?.data?.data?.results;
    if (!results || !Array.isArray(results)) {
      setComics([]);
      return;
    }
    const comicData = results.map((comic) => ({
      comicId: comic.id,
      title: comic.title || "No title available",
      description: comic.description || "No description available",
      image: comic.thumbnail
        ? `${(comic.thumbnail.path || "").replace(/^http:\/\//i, "https://")}.${comic.thumbnail.extension || "jpg"}`
        : "",
    }));
    shadowArray = [];
    setComics(comicData);
  };

  const createButtons = (p) => {
    let currentPage = 0;
    for (let i = 0; i < p; i++) {
      buttons = [...buttons, { i: i, page: currentPage, num: i + 1 }];
      currentPage += 20;
    }
  };

  const findPage = (page) => {
    const set = test.find((button) => button.num === page);
    next(set.page);
    console.log(set.page);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await search();
      if (response === undefined) {
        alert.show("Search failed. Try again.");
        return;
      }
      const total = response?.data?.data?.total ?? 0;
      const results = response?.data?.data?.results ?? [];
      if (total === 0 || results.length === 0) {
        alert.show("No characters found. Try e.g. Iron Man, Spider-Man, Batman.");
        setComics([]);
        return;
      }
      shadowArray = Array(Math.min(20, results.length)).fill(1);
      const p = Math.ceil(total / 20);
      createButtons(p);
      setTest([...buttons]);
      setResponse(response);
      buttons = [];
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Search failed.";
      alert.show(msg);
      setComics([]);
    }
  };

  if (loading) {
    return <div>LOADING...</div>;
  }

  return (
    <Container sx={{ py: 8, bgcolor: "transparent" }} maxWidth="lg">
      <Typography
        variant="h2"
        align="center"
        sx={{
          fontFamily: "Bangers",
          color: "#e50914",
          textShadow: "2px 2px 4px white, 0 0 8px white",
        }}
      >
        Comic Search
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} sx={{ margin: " auto" }}>
          {/* <button onClick={() => console.log(collection)}>click</button> */}
          <form action="submit" onSubmit={onSubmit}>
            {/* <input
              placeholder="Search by character..."
              type="text"
              style={{
                margin: "0 auto",
                width: "100%",
                height: "30px",
                align: "center",
                fontSize: "20px",
                borderRadius: "5px",
              }}
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
            /> */}
            <Autocomplete
              freeSolo
              id="free-solo-2-demo"
              disableClearable
              options={autos}
              renderInput={(params) => (
                <TextField
                  value={character}
                  onSelect={(e) => setCharacter(e.target.value)}
                  onChange={(e) => {
                    setCharacter(e.target.value);
                    createAutoComplete();
                  }}
                  {...params}
                  placeholder="e.g. Spider-Man, Thor, Hulk..."
                  sx={{
                    bgcolor: "white",
                    borderRadius: "5px",
                    "& .MuiInputBase-input": { color: "#000" },
                    "& .MuiInputBase-input::placeholder": { color: "rgba(0,0,0,0.6)", opacity: 1 },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    type: "search",
                  }}
                />
              )}
            />
            <button
              style={{
                float: "right",
                width: "100px",
                height: "30px",
                marginTop: "5px",
                backgroundColor: "#e50914",
                borderRadius: "5px",
                color: "white",
                fontWeight: "bold",
                border: "1px solid white",
              }}
            >
              SEARCH
            </button>
          </form>
        </Grid>
        <Grid item xs={12}>
          <Divider orientation="vertical" flexItem />
        </Grid>
        {shadowArray.length >= 1
          ? shadowArray.map((shadow) => {
            return <Shadow key={shadow} />;
          })
          : ""}
        {comics.length >= 1
          ? comics.map((comic) => {
            return (
              <Grid item xs={12} sm={6} md={3} key={comic.comicId}>
                <Flippy
                  style={cardStyle.frontSide}
                  className="flipCard"
                  flipOnClick={true}
                  flipDirection="horizontal"
                >
                  <FrontSide>
                    <img src={comic.image} alt={comic.title} style={imgStyle} />
                    <div style={cardCaptionStyle}>
                      <div style={cardCaptionTitle}>{comic.title}</div>
                      {comic.description && comic.description !== "No description" && (
                        <div style={cardCaptionSub}>{comic.description}</div>
                      )}
                    </div>
                  </FrontSide>
                  <BackSide style={cardStyle.backSide}>
                    <h3 style={{ margin: "0 0 8px", color: "#000" }}>{comic.title}</h3>
                    <p style={{ margin: "0 0 12px", color: "#333" }}>{comic.description}</p>
                    {Auth.loggedIn && (
                      <Button
                        sx={{ marginBottom: "5px" }}
                        color="success"
                        variant="contained"
                        disabled={collection.some(
                          (collected) => collected.comicId === comic.comicId
                        )}
                        // disabled={}
                        onClick={() => handleComicSave(comic.comicId)}
                      >
                        Save to Collection
                      </Button>
                    )}
                    {Auth.loggedIn && (
                      <Button
                        variant="contained"
                        onClick={() => handleComicWish(comic.comicId)}
                        disabled={wishlist.some(
                          (wish) => wish.comicId === comic.comicId
                        )}
                      >
                        Add to Wishlist
                      </Button>
                    )}
                  </BackSide>
                </Flippy>
              </Grid>
            );
          })
          : ""}
        <Grid item xs={12}>
          <Divider orientation="vertical" flexItem />
        </Grid>
        {test.length ? (
          <Pagination
            sx={{ margin: "auto" }}
            count={test.length}
            variant="contained"
            size="large"
            color="black"
            defaultPage={1}
            shape="rounded"
            onChange={(event, page) => {
              console.log("Go to Page: ", page);
              findPage(page);
            }}
          />
        ) : (
          ""
        )}
      </Grid>
    </Container>
  );
};

export default Tester;
