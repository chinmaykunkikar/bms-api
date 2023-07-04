const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const mysql2 = require("mysql2");

// Create Sequelize instance
const sequelize = new Sequelize("bms", "chinmay", "8087", {
  dialect: "mysql",
  dialectModule: mysql2,
});

// Define the models
const CinemaHall = sequelize.define("cinema_hall", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Screen = sequelize.define("screen", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Movie = sequelize.define("movie", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Screening = sequelize.define("screening", {
  showTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

// Set up associations
CinemaHall.hasMany(Screen);
Screen.belongsTo(CinemaHall);

Screen.hasMany(Screening);
Screening.belongsTo(Screen);

Movie.hasMany(Screening);
Screening.belongsTo(Movie);

// Set up Express app
const app = express();
app.use(express.json());

// Define routes
app.get("/cinema-halls/:cinemaHallId/dates", async (req, res) => {
  const { cinemaHallId } = req.params;
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  try {
    const cinemaHall = await CinemaHall.findByPk(cinemaHallId, {
      include: [
        {
          model: Screen,
          include: [
            {
              model: Screening,
              where: {
                showTime: {
                  [Sequelize.Op.between]: [today, nextWeek],
                },
              },
            },
          ],
        },
      ],
    });

    if (!cinemaHall) {
      return res.status(404).json({ error: "Cinema Hall not found" });
    }

    const screeningDates = cinemaHall.Screens.flatMap((screen) =>
      screen.Screenings.map((screening) =>
        new Date(screening.showTime).toDateString()
      )
    );

    const uniqueDates = [...new Set(screeningDates)];

    return res.json({ dates: uniqueDates });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/cinema-halls/:cinemaHallId/movies/:date", async (req, res) => {
  const { cinemaHallId, date } = req.params;

  try {
    const cinemaHall = await CinemaHall.findByPk(cinemaHallId, {
      include: [
        {
          model: Screen,
          include: [
            {
              model: Screening,
              where: {
                showTime: {
                  [Sequelize.Op.gte]: new Date(date),
                  [Sequelize.Op.lt]: new Date(date).setDate(
                    new Date(date).getDate() + 1
                  ),
                },
              },
              include: [Movie],
            },
          ],
        },
      ],
    });

    if (!cinemaHall) {
      return res.status(404).json({ error: "Cinema Hall not found" });
    }

    const movies = cinemaHall.Screens.flatMap((screen) =>
      screen.Screenings.map((screening) => ({
        movieTitle: screening.Movie.title,
        showTime: screening.showTime,
      }))
    );

    return res.json({ movies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(3000, () => {
  sequelize.sync();
  console.log("Server is running on port 3000");
});
