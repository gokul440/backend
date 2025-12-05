let data={
    Name:"Gokul",
    Age:19,
    Dept:"CSE",
    Mark:[95,99,98]
};
console.log(data);

data.Name="Hariharan";
console.log(data);

let updated={...data,Percentage:75};
console.log(updated);

let highestMark=Math.max(...data.Mark);
console.log("Highest Mark:",highestMark);
