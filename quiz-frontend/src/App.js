import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import DragDropQuiz from "./pages/DragDropQuiz";
import VisualQuizGame from "./pages/VisualQuizGame";
import MatchingGame from "./pages/MatchingGame";
import AudioQuizGame from "./pages/AudioQuizGame";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/drag-quiz/:id" element={<DragDropQuiz />} />
        <Route path="/visual-quiz/:id" element={<VisualQuizGame />} />
        <Route path="/matching-quiz/:id" element={<MatchingGame />} />
        <Route path="/audio-quiz/:id" element={<AudioQuizGame />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
