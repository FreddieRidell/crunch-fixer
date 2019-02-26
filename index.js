const csv = require("csv-parser");
const results = [];
const { parseISO, format } = require("date-fns/fp");
const R = require("ramda");

process.stdin
  .pipe(csv())
  .on("data", row => {
    results.push(row);
  })
  .on("end", () => {
    console.log("Date,Transaction description,Amount,Balance");

    R.pipe(
      R.map(row => ({
        date: row["Date"],
        description: row["Transaction description"],
        amount: row["Amount"]
      })),

      R.map(R.over(R.lensProp("amount"), x => parseFloat(x, 10))),
      R.map(
        R.over(
          R.lensProp("date"),
          R.pipe(
            parseISO,
            format("dd/MM/yyyy")
          )
        )
      ),

      R.reverse,

      R.mapAccum(
        (acc, value) => [
          Math.round((acc + value.amount) * 100) / 100,
          {
            ...value,
            balance: Math.round((acc + value.amount) * 100) / 100
          }
        ],
        0
      ),

      R.nth(1),

      R.map(({ date, description, amount, balance }) =>
        [date, description, amount, balance].join(", ")
      ),

      R.join("\n"),
      console.log
    )(results);
  });
