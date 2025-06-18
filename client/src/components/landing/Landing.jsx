import "./landing.scss";

function Landing() {
  return (
    <div className="exams-time-container">
      <div className="exams-content">
        <div className="text-section">
          <h1 className="title">EXAMS TIME</h1>

          <p className="description">
            Here we are. Are you ready to fight? Don't worry, we prepared some
            tips to be ready for your exams.
          </p>

          <blockquote className="quote">
            "Nothing happens until something moves" - Albert Einstein
          </blockquote>

          <button
            className="cta-button"
            aria-label="View exam preparation tips"
          >
            View exams tips
          </button>
        </div>

        <div className="right-section">
          <div className="image-container">
            <img
              src="https://cdn.pixabay.com/photo/2017/03/27/12/50/flower-2178507_640.jpg"
              alt="Students preparing for exams"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
