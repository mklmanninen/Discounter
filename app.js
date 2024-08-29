$(function() {
    //Note:Using Exchange Rates API for currency exchange
    const apiKey = "?access_key=c520b1e036f2b2d311444f8793f0bf1c"; // Authentication token
    const baseURL = "http://api.exchangeratesapi.io/v1/"; //URL

    const symbols = baseURL + "symbols" + apiKey; //To get available currencies
    const latestCurrencies = baseURL + "latest" + apiKey; //To get latest currencies
    const convertRequest = baseURL + "convert" + apiKey; //To access conversion functionalities

    //These fields are populated with currency symbols
    const currencyFrom = $("#currency1");
    const currencyTo = $("#currency2");

    //For counting the total sum of products, without conversion, without discount.
    let sum = 0;
    let discount = 0; //To set discount when Calculate (btn-total) button is pressed. 

    //The function populates currency fields with all available currencies.
    function populateSymbols(){
      const response = fetch(symbols)
      .then(response => {
        console.log("response is " + response);
        if (!response.ok) { //check the response
          throw new Error("Could not fetch resource")
        }

        const dataSymbols = response.json();
        console.log("response in json: " + dataSymbols);
        return dataSymbols;
      })
      .then(data => { //Insert the data
        const allCurrencies = data.symbols;

        //Populate fields
        $.each(allCurrencies, function(code, name) {
          let options = "";
          
          //EUR is made to be the default value.
          if (code == "EUR" || code == "eur") {
            options = `<option value="${code}" selected>${code}</option>`;
          }
          else {options = `<option value="${code}">${code}</option>`;}
          
          currencyFrom.append(options);
          currencyTo.append(options);
        })
      })
      
    }

    populateSymbols();

    let prodNum = 0; //For tagging the products
    let prices = []; //This Array is for performing calculations later on
      
    //Add button
    $("#btn-add").click(function() {
      prodNum += 1;
      let price = parseFloat($("#price").val()); //The input value is parsed to float

      prices.push(price); //Each price is added to the array

      //Add a new row of data per click
      let dataTable = $("#dataTable");
      let row = "<tr>" +
                  "<td class='border'>" + prodNum + "</td>" +
                  "<td class='border'>" + price + "</td>" +
                  "</tr>";
      dataTable.append(row);
    })

    //Calculate discount when button is clicked
    $("#btn-total").click(function() {
      
      let resultDiscount = $("#resultDiscount");
      let resultSum = $("#sum");
      discount = parseFloat($("#discount").val());

      //Sum calculated by looping through the "prices" array
      for (let i = 0; i <prices.length; i++) {
          sum += prices[i];
      }

      //Calculate discount
      //Original
      resultSum.text(sum);
      let discountInEur = discount * (sum/100);
      let discountedPrice = sum - discountInEur;
      //With discount
      resultDiscount.text(discountedPrice);
    })   

    //CREATING ANOTHER TABLE with conversions
    function CreateConversionTable(conversionRate){
      let conversionTable = $("#conversionTable");
      let conversionP = conversionRate
      console.log("conversion called");
      
      for (let i = 0; i <prices.length; i++) {
        let convertedPrice = 0;
        convertedPrice = prices[i] * conversionP;
        let row = "<tr>" + "<td class='border'>" + convertedPrice + "</td>" + "</tr>";
        conversionTable.append(row);
        }

    }

    //EXCHANGE RATE CONVERSION
    $("#btn-convert").click(async function() {
      let convertedSums = $("#convertedSums");

      // Chosen rates
      let from = currencyFrom.val();
      let to = currencyTo.val();

      //Modify table headings to present the currency
      $("#ogPrice").text(`Original Price (${from})`);
      $("#convPrice").text(`Converted Price (${to})`);

      // Request
      const requestUrl = `${latestCurrencies}&base=EUR&symbols=${from},${to}`;
      console.log("request: " + requestUrl);

      //Response
      try {
        const response = await fetch(requestUrl);
        if (!response.ok) {
          alert("Could not fetch exchange rates");
          return; // Exit function early if response is not ok
        }

        const currencyData = await response.json();
        let rates = currencyData.rates;
        console.log(rates);

        let fromRate = rates[from];
        let toRate = rates[to];

        let conversionRate = toRate / fromRate;
        CreateConversionTable(conversionRate);

        // Convert sum and discounted price
        let discountedPrice = sum - (discount * (sum/100));
        let convertedWithoutDiscount = sum * conversionRate;
        let convertedWithDiscount = discountedPrice * conversionRate;

        let resultText = `Converted from ${from} to ${to}.\nTotal sum without discount: ${convertedWithoutDiscount.toFixed(2)}. \nWith discount: ${convertedWithDiscount.toFixed(2)}`;
        convertedSums.text(resultText);

      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        alert("An error occurred while fetching data.");
      }
    });

})
  
