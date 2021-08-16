import EventList from "./components/EventList";
import "./App.css";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "Muli", "Mulish"
    ].join(","),
  },});
function App() {
  return (
    <ThemeProvider theme={theme}>
      <EventList></EventList>
    </ThemeProvider>
  );
}

export default App;
