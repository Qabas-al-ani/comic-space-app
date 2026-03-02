import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Link as Route } from 'react-router-dom';

import { LOGIN } from "../utils/mutations";
import Auth from "../utils/auth";
// import Boom from "../images/boom.jpeg";
// import Spines from "../images/collectionSpines.jpeg";
import Halo from "../images/collectionHalo.jpeg";
// import Thor from "../images/thor.jpeg";
// import Parker from "../images/parker.jpeg";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      align="center"
      sx={{ color: "rgba(255,255,255,0.5)" }}
      {...props}
    >
      {"Copyright © "}
      <Link href="#" sx={{ color: "#e50914" }}>
        Comic Space
      </Link>{" "}
      {new Date().getFullYear()}
    </Typography>
  );
}

const netflixTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#e50914" },
    background: { default: "#000000", paper: "#141414" },
    text: { primary: "#ffffff", secondary: "rgba(255,255,255,0.7)" },
  },
});

// Light theme only for email/password inputs – white background, black text
const formInputsTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#e50914" },
  },
});

export default function SignInSide() {
  const [userFormData, setUserFormData] = useState({ email: "", password: "" });
  const [loginUser] = useMutation(LOGIN);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      const { data } = await loginUser({
        variables: { ...userFormData },
      });

      Auth.login(data.login.token);
    } catch (err) {
      console.error(err);
    }

    setUserFormData({
      email: "",
      password: "",
    });
  };

  return (
    <ThemeProvider theme={netflixTheme}>
      <Grid container component="main" sx={{ height: "100vh", backgroundColor: "#000" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${Halo})`,
            backgroundRepeat: "no-repeat",
            backgroundColor: "#000",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={0}
          square
          sx={{ backgroundColor: "#000", borderLeft: "1px solid rgba(229,9,20,0.2)" }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "#e50914" }}>
              <LockOutlinedIcon sx={{ color: "#fff" }} />
            </Avatar>
            <Typography component="h1" variant="h4" align="center" sx={{ color: "#fff", fontWeight: 700 }}>
              Welcome to Comic Space!
            </Typography>
            <Typography component="p" variant="h6" sx={{ color: "#e50914", mt: 0.5 }}>
              Please sign in
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleFormSubmit}
              sx={{ mt: 2, width: "100%" }}
            >
              <ThemeProvider theme={formInputsTheme}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  value={userFormData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  autoFocus
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff",
                      "& fieldset": { borderColor: "rgba(0,0,0,0.23)" },
                      "&:hover fieldset": { borderColor: "#e50914" },
                      "&.Mui-focused fieldset": { borderColor: "#e50914", borderWidth: 2 },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#e50914" },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  value={userFormData.password}
                  onChange={handleInputChange}
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff",
                      "& fieldset": { borderColor: "rgba(0,0,0,0.23)" },
                      "&:hover fieldset": { borderColor: "#e50914" },
                      "&.Mui-focused fieldset": { borderColor: "#e50914", borderWidth: 2 },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#e50914" },
                  }}
                />
              </ThemeProvider>
              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      "&.Mui-checked": { color: "#e50914" },
                    }}
                  />
                }
                label={<span style={{ color: "rgba(255,255,255,0.9)" }}>Remember me</span>}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  backgroundColor: "#e50914",
                  color: "#fff",
                  fontWeight: 700,
                  "&:hover": { backgroundColor: "rgba(229,9,20,0.85)" },
                }}
              >
                Sign in
              </Button>
              <Grid container justifyContent="space-between">
                <Grid item>
                  <Link href="#" sx={{ color: "#e50914", "&:hover": { color: "#ff1a1a" } }}>
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link component={Route} to="/signup" sx={{ color: "#e50914", "&:hover": { color: "#ff1a1a" } }}>
                    Don't have an account? Sign Up
                  </Link>
                </Grid>
              </Grid>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
