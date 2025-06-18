import "./home.scss";
import Landing from "../../components/landing/Landing";
import Announcement from "../../components/announcement/Announcement";
import Quiz from "../../components/quiz/Quiz";

function Home() {
  return (
    <div className="home-page">
      <Landing />
      <div className="home-content">
        <Announcement />
        <Quiz />
      </div>
    </div>
  );
}

export default Home;
