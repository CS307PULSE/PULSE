import React, { useState } from "react";
import axios from "axios";

async function sendSearchAndReturn(sendSearch) {
  const axiosInstance = axios.create({
    withCredentials: true,
  });
  const response = await axiosInstance.post(
    "http://127.0.0.1:5000/api/search_bar",
    { query: sendSearch }
  );
  const data = response.data;
  console.log("Got");
  console.log(response);
  console.log(sendSearch);
  return data;
}

export default function FilterPopup({
  isOpen,
  onClose,
  itemsSelectable,
  setItems,
  maxSelection = 100,
  emotionData = false,
}) {
  const [itemsSelected, setItemsSelected] = useState([]);
  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    // Read the form data
    const form = e.target;
    const formData = new FormData(form);
    const formJson = {};
    let counter = 0;
    //Converts to JSON object
    for (let [name, value] of formData) {
      //If item exists already - then add to array
      if (formJson[name]) {
        if (!Array.isArray(formJson[name])) {
          formJson[name] = [formJson[name]]; // Convert to array if it's not already
        }
        formJson[name].push(value);
      } else {
        formJson[name] = [value];
      }
      counter++;
      if (counter >= maxSelection) {
        alert(
          "More than " +
            maxSelection +
            " values were selected - only the first " +
            maxSelection +
            " were used!"
        );
        break;
      }
    }

    if (itemsSelectable === undefined) {
      sendSearchAndReturn(formJson.searchItem).then((data) => {
        if (data !== null && data !== undefined) {
          setItems(data);
          console.log("This is filter selection:");
          console.log(data);
          onClose();
        } else {
          alert("Invalid Selection!");
        }
      });
    } else {
      setItems(formJson.items);
      console.log("This is filter selection:");
      console.log(formJson);
      onClose();
    }
  }

  function selectXindexes(start = 0, end, random = false) {
    let selected = [];
    if (!random) {
      for (let i = start; i < end; i++) {
        if (i >= itemsSelectable.length) {
          break;
        }
        selected.push(
          emotionData
            ? itemsSelectable[i].uri + "," + i
            : itemsSelectable[i].uri
        );
      }
    } else {
      let randNums = [];
      for (let i = start; i < end; i++) {
        const randNum = Math.round(
          Math.random() * (itemsSelectable.length - 1)
        );
        //If num out of bounds or selected already
        if (randNum >= itemsSelectable.length || randNums.includes(randNum)) {
          i--;
          continue;
        }
        selected.push(
          emotionData
            ? itemsSelectable[randNum].uri + "," + i
            : itemsSelectable[randNum].uri
        );
      }
    }
    setItemsSelected(selected);
  }

  if (!isOpen) return null; //Don't do anything when not open

  return (
    <div className="PopupOverlay custom-draggable-cancel">
      <div className="PopupContent">
        Filter selection
        <button className="PopupCloseButton" onClick={onClose}>
          X
        </button>
        <form onSubmit={handleSubmit}>
          <div>
            {itemsSelectable === undefined ? (
              <input
                name="searchItem"
                rows={1}
                cols={20}
                className="nameField"
                placeholder="ItemSelected"
                required={true}
              />
            ) : (
              <select
                name="items"
                value={itemsSelected}
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.target.selectedOptions
                  ).map((option) => option.value);
                  setItemsSelected(selectedOptions);
                }}
                multiple={true}
                required={true}
              >
                {itemsSelectable.map((item, index) => {
                  return (
                    <option
                      key={emotionData ? item.uri + "," + index : item.uri}
                      value={emotionData ? item.uri + "," + index : item.uri}
                      selected={itemsSelected.includes(
                        emotionData ? item.uri + "," + index : item.uri
                      )}
                    >
                      {item.name}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
          {itemsSelectable !== undefined ? (
            <div>
              <p>Automatic Selection</p>
              <button
                className="FilterTopButton"
                onClick={() => {
                  selectXindexes(0, 10);
                }}
              >
                Top 10
              </button>
              <button
                className="FilterTopButton"
                onClick={() => {
                  selectXindexes(0, 25);
                }}
              >
                Top 25
              </button>
              <button
                className="FilterTopButton"
                onClick={() => {
                  selectXindexes(0, 10, true);
                }}
              >
                Random 10
              </button>
            </div>
          ) : null}
          <div>
            <button className="TypButton" type="submit">
              Generate Graph
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
