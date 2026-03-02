import * as React from "react";
// import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
// import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
// import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import MoreIcon from "@mui/icons-material/MoreVert";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { Avatar } from "@mui/material";
import Auth from "../utils/auth";

const comicSpaceLogo = process.env.PUBLIC_URL + "/comic-space-icon.png";

// const Search = styled("div")(({ theme }) => ({
//   position: "relative",
//   borderRadius: theme.shape.borderRadius,
//   backgroundColor: alpha(theme.palette.common.white, 0.15),
//   "&:hover": {
//     backgroundColor: alpha(theme.palette.common.white, 0.25),
//   },
//   marginRight: theme.spacing(2),
//   marginLeft: 0,
//   width: "100%",
//   [theme.breakpoints.up("sm")]: {
//     marginLeft: theme.spacing(3),
//     width: "auto",
//   },
// }));

// const SearchIconWrapper = styled("div")(({ theme }) => ({
//   padding: theme.spacing(0, 2),
//   height: "100%",
//   position: "absolute",
//   pointerEvents: "none",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
// }));

// const StyledInputBase = styled(InputBase)(({ theme }) => ({
//   color: "inherit",
//   "& .MuiInputBase-input": {
//     padding: theme.spacing(1, 1, 1, 0),
//     // vertical padding + font size from searchIcon
//     paddingLeft: `calc(1em + ${theme.spacing(4)})`,
//     transition: theme.transitions.create("width"),
//     width: "100%",
//     [theme.breakpoints.up("md")]: {
//       width: "20ch",
//     },
//   },
// }));

export default function PrimarySearchAppBar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const openSupportChat = () => {
    if (typeof window !== "undefined" && window.Tawk_API) {
      if (typeof window.Tawk_API.maximize === "function") {
        window.Tawk_API.maximize();
      } else {
        window.Tawk_API.onLoad = function () {
          window.Tawk_API.maximize();
        };
      }
    }
    handleMobileMenuClose();
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          backgroundColor: "#000000",
          boxShadow: "0 0 20px white, 0 0 40px rgba(255,255,255,0.25)",
          "& .MuiMenuItem-root, & p": { color: "#E50914" },
        },
      }}
    >
      <MenuItem onClick={handleMenuClose} component={Link} to="/">
        Home
      </MenuItem>

      {!Auth.loggedIn() && (
        <MenuItem onClick={handleMenuClose} component={Link} to="/login">
          Sign In
        </MenuItem>
      )}
      <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
        Profile
      </MenuItem>

      <MenuItem onClick={handleMenuClose} component={Link} to="/search">
        Search for Comics
      </MenuItem>

      {!Auth.loggedIn() && (
        <MenuItem onClick={handleMenuClose} component={Link} to="/signup">
          Create an Account
        </MenuItem>
      )}
      <MenuItem onClick={handleMenuClose} component={Link} to="/listings">
        Comics For Sale
      </MenuItem>
      <MenuItem onClick={handleMenuClose} component={Link} to="/discussion">
        Join Discussion
      </MenuItem>
      {Auth.loggedIn() && (
        <MenuItem
          onClick={() => {
            handleMenuClose();
            Auth.logout();
          }}
          component={Link}
          to="/"
        >
          Logout
        </MenuItem>
      )}
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: {
          backgroundColor: "#000000",
          boxShadow: "0 0 20px white, 0 0 40px rgba(255,255,255,0.25)",
          "& .MuiMenuItem-root, & p": { color: "#E50914" },
        },
      }}
    >
      <MenuItem onClick={openSupportChat}>
        <IconButton size="large" aria-label="Customer support chat" color="inherit">
          <Badge badgeContent={0} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Customer support</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#000000", boxShadow: "none" }}
      >
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}

          <Typography
            variant="h6"
            noWrap
            component={Link}
            image={comicSpaceLogo}
            to="/"
            sx={{
              textDecortaion: "none",
              border: "none",
              color: "inherit",
              display: { xs: "none", sm: "block" },
            }}
          >
            <img
              src={comicSpaceLogo}
              alt="main logo"
              style={{
                height: "40px",
                width: "auto",
                maxHeight: "40px",
                marginTop: "5px",
                borderRadius: "5px",
                boxShadow: "2px 2px 4px black",
              }}
            ></img>
          </Typography>
          {/* <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
            />
          </Search> */}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              size="large"
              aria-label="Customer support chat"
              color="inherit"
              onClick={openSupportChat}
            >
              <Badge badgeContent={0} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ bgcolor: "#E50914", textAlign: "center" }}>
                <MenuIcon />
              </Avatar>
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}
