import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Watchlist.css";
import User from "../User";

const MovieCard = ({ movie, review, create }) => {
  const navigate = useNavigate();

  const handleMovieClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="my-watchlist-movie-item mb-4">
      <div className="d-flex align-items-start">
        <img
          src={`https://image.tmdb.org/t/p/w200/${movie.poster_path}`}
          className="my-watchlist-img-thumbnail me-3"
          alt={movie.title}
          onClick={handleMovieClick}
          style={{ cursor: "pointer" }}
        />
        <div className="flex-grow-1">
          <h5 className="mb-1" style={{ color: "yellow", fontWeight: "bold" }}>
            {movie.title}
          </h5>
          <p className="mb-1 text-white">
            {create.substr(0, 10)} {create.substr(12, 4)}
          </p>
          <p
            className="my-watchlist-movie-overview text-white"
            style={{ fontSize: "20px" }}
          >
            {review}
          </p>
        </div>
      </div>
      <hr style={{ color: "yellow" }} />
    </div>
  );
};

const UserReview = () => {
  const supabaseUrl = "https://ksnouxckabitqorjucgz.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzbm91eGNrYWJpdHFvcmp1Y2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ0MzM4ODgsImV4cCI6MjAzMDAwOTg4OH0.17MF1DByop1lCcnefGB8t3AcS1CGcJvbzunwY3QbK_c";

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const [session, setSession] = useState(null);
  const [movies, setMovies] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching user data:", error.message);
      } else {
        setSession(data.session);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchReviewData = async () => {
      if (session) {
        const { data, error } = await supabase
          .from("reviews")
          .select("movie_id, review, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          console.error("Error fetching reviews:", error.message);
        } else {
          setReviews(data);
        }
      }
    };

    fetchReviewData();
  }, [session]);

  const fetchMovieDetails = async (movieId) => {
    const options = {
      method: "GET",
      url: `https://api.themoviedb.org/3/movie/${movieId}`,
      params: {
        api_key: "b2efe9b0108d8645f514bc9b0363d199",
      },
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
      const fetchedMovies = [];
      for (const item of reviews) {
        const movie = await fetchMovieDetails(item.movie_id);
        if (movie) {
          fetchedMovies.push({
            ...movie,
            review: item.review,
            created_at: item.created_at,
          });
        }
      }
      setMovies(fetchedMovies);
    };

    fetchMovies();
  }, [reviews]);

  return (
    <div
      className="watchlist"
      style={{ transition: "box-shadow 0.3s ease-in-out" }}
    >
      <div className="lists">
        <div>
          <div className="rating">
            <h2
              style={{
                color: "gold",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "40px",
              }}
            >
              Your Review
            </h2>
            <p style={{ color: "white", fontWeight: "bold", fontSize: "20px" }}>
              Most Recently Review
            </p>
            <div
              style={{
                maxHeight: "500px" /* adjust the height as needed */,
                overflowY: "auto",
              }}
            >
              {movies ? (
                movies.map((movie, index) => {
                  return (
                    <div key={`${movie.id}-${index}`}>
                      <MovieCard
                        movie={movie}
                        review={movie.review}
                        create={movie.created_at}
                      />
                    </div>
                  );
                })
              ) : (
                <div>No movies You had review </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserReview;
