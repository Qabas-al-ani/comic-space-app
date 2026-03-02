import React, { useState, useEffect, useMemo } from "react";
import Grid from "@mui/material/Grid";
import ImageGrid from "../ImageGrid";
import MainImage from "../MainImage";
import Info from "../Info";
import { useQuery, useMutation } from "@apollo/client";
import { LISTINGS, QUERY_ME } from "../../utils/queries";
import { POST_COMIC } from "../../utils/mutations";

export default function Listings() {
  const { loading: listingsLoading, data: listingsData, refetch: refetchListings } = useQuery(LISTINGS);
  const { data: meData, refetch: refetchMe } = useQuery(QUERY_ME);
  const [postComic] = useMutation(POST_COMIC, {
    refetchQueries: [{ query: LISTINGS }, { query: QUERY_ME }],
  });
  const [selectedImage, setSelectedImage] = useState(0);

  const handleListForSale = async (input) => {
    try {
      await postComic({ variables: { input } });
      await refetchListings();
      await refetchMe();
    } catch (err) {
      console.error("List for sale failed:", err);
    }
  };

  const posts = listingsData?.posts ?? [];
  const wishlist = meData?.me?.wishlist ?? [];

  const comics = useMemo(() => {
    const postIds = new Set((posts || []).map((p) => p.comicId));
    const fromWishlist = (wishlist || []).filter(
      (w) => w.comicId != null && !postIds.has(w.comicId)
    );
    const wishlistOnly = fromWishlist.map((w) => ({
      ...w,
      isWishlistOnly: true,
      price: null,
      tradeable: null,
    }));
    return [...(posts || []), ...wishlistOnly];
  }, [posts, wishlist]);

  const images = useMemo(
    () => comics.map((c) => c.image).filter(Boolean),
    [comics]
  );

  useEffect(() => {
    if (selectedImage >= comics.length && comics.length > 0) {
      setSelectedImage(0);
    }
  }, [comics.length, selectedImage]);

  const loading = listingsLoading;
  if (loading) {
    return <div>LOADING...</div>;
  }

  if (comics.length === 0) {
    return (
      <div style={{ padding: 24, color: "#e50914", textAlign: "center" }}>
        <p>No comics for sale yet.</p>
        <p>Add comics to your wishlist from Comic Search, then they’ll appear here so you can list them for sale or see when others list them.</p>
      </div>
    );
  }

  const selected = comics[selectedImage] || comics[0];
  const selectedImageUrl = images[selectedImage] || images[0];

  return (
    <div>
      <Grid
        container
        spacing={1}
        style={{ maxWidth: 1100, margin: "0 auto", padding: "10px" }}
      >
        <Grid item sm={1}>
          <ImageGrid
            images={images}
            onSelect={setSelectedImage}
            selectedImage={selectedImage}
          />
        </Grid>
        <Grid item sm={5}>
          <MainImage src={selectedImageUrl} />
        </Grid>
        <Grid item sm={6}>
          <Info {...selected} onListForSale={handleListForSale} />
        </Grid>
      </Grid>
    </div>
  );
}
