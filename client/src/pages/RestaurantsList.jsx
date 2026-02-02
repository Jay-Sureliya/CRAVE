// pages/RestaurantsList.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

const RestaurantsList = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    api.get("/restaurants") // your API to get all restaurants
      .then(res => setRestaurants(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Restaurants</h1>
      <ul className="space-y-3">
        {restaurants.map(r => (
          <li key={r.id}>
            <Link
              to={`/rest/${r.id}`}
              className="text-orange-500 font-bold hover:underline"
            >
              {r.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RestaurantsList;
