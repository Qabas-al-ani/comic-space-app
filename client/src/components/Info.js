import { Divider, Grid, Typography, Button, Box, TextField } from "@mui/material";
import React, { useState } from "react";

function Info({
  title,
  description,
  price,
  tradeable,
  isWishlistOnly,
  comicId,
  image,
  onListForSale,
}) {
  const [listPrice, setListPrice] = useState("");
  const [listTradeable, setListTradeable] = useState(true);

  const handleListForSale = () => {
    if (onListForSale && title) {
      onListForSale({
        comicId,
        title,
        description: description || "",
        image: image || "",
        price: listPrice || "0",
        tradeable: listTradeable,
      });
    }
  };

  return (
    <Grid container direction="column" style={{ height: "100%" }}>
      <Divider />
      <Box mt={2}>
        <Typography variant="h4" sx={{ color: "#e50914" }}>{title}</Typography>
        <Typography variant="subtitle1" sx={{ color: "rgba(255,255,255,0.9)" }}>{description || "—"}</Typography>
        {!isWishlistOnly && price != null && (
          <Typography variant="h5" sx={{ color: "#e50914" }}>${price}</Typography>
        )}
      </Box>
      {isWishlistOnly ? (
        <Box mt={2}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mb: 1 }}>
            Not listed yet. List it for sale so others can purchase or offer a trade.
          </Typography>
          <TextField
            label="Price ($)"
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value)}
            size="small"
            sx={{
              mb: 1,
              width: "100%",
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.8)" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
              "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#e50914" },
            }}
            inputProps={{ type: "text", placeholder: "e.g. 15.00" }}
          />
          <Button
            variant="contained"
            onClick={handleListForSale}
            sx={{ backgroundColor: "#e50914", color: "#fff", mt: 1 }}
          >
            List for sale
          </Button>
        </Box>
      ) : (
        <>
          <Button variant="contained" sx={{ marginTop: "auto", backgroundColor: "#e50914", color: "#fff" }}>
            Purchase
          </Button>
          <Button variant="outlined" sx={{ marginTop: "5px", borderColor: "#e50914", color: "#e50914" }}>
            Offer Trade
          </Button>
        </>
      )}
    </Grid>
  );
}

export default Info;
