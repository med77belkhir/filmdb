import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MovieCard = ({ movie, rating }) => {
  const navigate = useNavigate();

  const handleMovieClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div
      onClick={handleMovieClick}
      style={{
        backgroundColor: "#000",
        color: "#fff",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        margin: "10px",
        width: "250px",
        height: "300px",
        textAlign: "center",
        cursor: "pointer",
      }}
      className="movie_card"
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        style={{ width: "200px", height: "200px" }}
      />
      <h3 style={{ fontSize: "20px", margin: "10px auto" }}>{movie.title}</h3>
      <p>{rating}</p>
    </div>
  );
};

const UserRating = () => {
  const supabaseUrl = "https://ksnouxckabitqorjucgz.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzbm91eGNrYWJpdHFvcmp1Y2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ0MzM4ODgsImV4cCI6MjAzMDAwOTg4OH0.17MF1DByop1lCcnefGB8t3AcS1CGcJvbzunwY3QbK_c";

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const [session, setSession] = useState(null);
  const [movies, setMovies] = useState([]);
  const [rating, setRating] = useState([]);
  const [moviesrating, setMoviesRating] = useState([]);

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
    const fetchRatingData = async () => {
      if (session) {
        const { data, error } = await supabase
          .from("ratings")
          .select("movie_id,rating")
          .eq("user_id", session.user.id)
          .order("created_at", {
            ascending: false,
          }); // Tri par date (du plus récent au plus ancien)
        // .limit(1); // Récupère uniquement la première entrée (la plus récente)

        if (error) {
          console.error(
            "Erreur lors de la récupération des notations :",
            error.message
          );
        } else {
          console.log(data);
          setRating(data);
          // console.log(setRating);
        }
      }
    };
    fetchRatingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setMovies((prevMovies) => [...prevMovies, response.data]);
      // console.log(movies);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
      for (const item of rating) {
        await fetchMovieDetails(item.movie_id);
        setMoviesRating(item.rating);
      }
    };

    fetchMovies();

    setMovies([]);
  }, [rating]);

  return (
    <div className="watchlist">
      <div className="lists">
        <div>
          <div className="rating">
            <h2 style={{ color: "gold" }}>Your Rating</h2>
            <p style={{ color: "white" }}>Most Recently Rated</p>
            <div>
              {/*               
              {movies ? (
                movies.map((movie, index) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    rating={rating[index]?.rating}
                  />
                ))
              ) : (
                <div>No movies in the watchlist </div>
              )}{" "} */}
              <Slider
                dots={true}
                infinite={false}
                slidesToShow={4}
                slidesToScroll={1}
                responsive={[
                  {
                    breakpoint: 1024,
                    settings: {
                      slidesToShow: 2,
                    },
                  },
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 1,
                    },
                  },
                ]}
              >
                {movies.length > 0 ? (
                  movies.map((movie, index) => {
                    return (
                      <div key={`${movie.id}-${index}`}>
                        <MovieCard
                          movie={movie}
                          rating={rating[index]?.rating}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div>No movies you had rated </div>
                )}
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRating;
