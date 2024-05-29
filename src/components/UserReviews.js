import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MovieCard = ({ movie, review }) => {
  const navigate = useNavigate();

  const handleMovieClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div
      style={{
        color: "#fff",
        padding: "10px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        margin: "10px",
        width: "50",

        textAlign: "center",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      // className="movie_card"
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        //
        style={{ width: "200px", height: "200px", cursor: "pointer" }}
        onClick={handleMovieClick}
      />
      <div>
        <h3 style={{ fontSize: "20px", margin: "10px auto" }}>{movie.title}</h3>
        <p>{review}</p>
      </div>
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
  const [review, setReview] = useState([]);


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
          .select("movie_id,review,created_at")
          .eq("user_id", session.user.id)
          .order("created_at", {
            ascending: false,
          });
        if (error) {
          console.error(
            "Erreur lors de la récupération des notations :",
            error.message
          );
        } else {
          // console.log(data);
          setReview(data);
        }
      }
    };
    fetchReviewData();
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
      for (const item of review) {
        await fetchMovieDetails(item.movie_id);


        console.log(item);
        // console.log(create);

      }
    };

    fetchMovies();

    setMovies([]);
  }, [review]);

  return (
    <div className="watchlist">
      <div className="lists">
        <div>
          <div className="rating">
            <h2 style={{ color: "gold" }}>Your Review</h2>
            <p style={{ color: "white" }}>Most Recently Review</p>
            <div>
              {movies ? (
                movies.map((movie, index) => {
                  return (
                    <div key={`${movie.id}-${index}`}>
                      <MovieCard movie={movie} review={review[index]?.review} />
                    </div>
                  );
                })
              ) : (
                <div>No movies You had review </div>
              )}{" "}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReview;
