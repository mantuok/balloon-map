import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import BalloonMap from "./components/BalloonMap/BalloonMap";
import "./App.scss";

const App = () => {
  return (
    <div className="container">
      <Header />
      <main className="main">
        <h1 className="main__heading">Balloon Trajectories + Live Weather</h1>
        <p className="main__description">Explore 24-hour balloon paths with real-time wind data.</p>
        <BalloonMap />
      </main>
      <Footer />
    </div>
  );
};

export default App;
