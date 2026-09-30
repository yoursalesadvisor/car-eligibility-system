let cars = [];
let currentVariant = null;

const familySelect = document.getElementById("family");
const variantSelect = document.getElementById("variant");


// LOAD CAR DATA
fetch("data/cars.json")
    .then(response => response.json())
    .then(data => {
        cars = data;
        loadFamily();
    })
    .catch(error => {
        console.error("Gagal load cars.json:", error);
    });


// LOAD MODEL
function loadFamily() {

    familySelect.innerHTML = `
        <option value="">Pilih Model</option>
    `;

    cars.forEach(car => {

        let option = document.createElement("option");

        option.value = car.family;
        option.textContent = car.family;

        familySelect.appendChild(option);
    });
}


// PILIH MODEL
familySelect.addEventListener("change", function() {

    let selectedFamily = this.value;

    variantSelect.innerHTML = `
        <option value="">Pilih Variant</option>
    `;

    let selectedCar = cars.find(
        car => car.family === selectedFamily
    );

    if (selectedCar) {

        selectedCar.variants
            .filter(variant => variant.status === "Active")
            .forEach(variant => {

                let option = document.createElement("option");

                option.value = variant.name;
                option.textContent = variant.name;

                variantSelect.appendChild(option);
            });
    }
});


// PILIH VARIANT
variantSelect.addEventListener("change", function() {

    let selectedVariant = this.value;
    let selectedFamily = familySelect.value;

    let selectedCar = cars.find(
        car => car.family === selectedFamily
    );

    if (selectedCar) {

        let variantData = selectedCar.variants.find(
            variant => variant.name === selectedVariant
        );

        if (variantData) {

            currentVariant = variantData;

            document.getElementById("whatsappBtn").disabled = false;

            document.getElementById("price").value =
                variantData.price;

            document.getElementById("interest").textContent =
                variantData.interest + "%";

            document.getElementById("tenure").value =
                variantData.loanYear;

            calculateLoan();
        }
    }
});


// FORMAT RM
// FORMAT RM
// FORMAT RM
function formatRM(value) {
    return Number(value).toLocaleString("en-MY", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


// CALCULATE LOAN
function calculateLoan() {

    console.log("KIRA JALAN");

    if (!currentVariant) {
        return;
    }

    let price =
        Number(document.getElementById("price").value) || 0;

    let downpaymentInput =
        Number(document.getElementById("downpayment").value) || 0;

    let rebate =
        Number(document.getElementById("rebate").value) || 0;

    let interest =
        Number(currentVariant.interest) || 0;

    let tenure =
        Number(document.getElementById("tenure").value) || 9;


    // ================================
    // DOWNPAYMENT RM / %
    // ================================

    let downpaymentType =
        document.getElementById("downpaymentType").value;

    let downpayment = 0;


    // Kalau pilih RM
    if (downpaymentType === "rm") {

        downpayment = downpaymentInput;

    }


    // Kalau pilih %
    if (downpaymentType === "percent") {

        downpayment =
            price * (downpaymentInput / 100);

    }


    // ================================
    // LOAN AMOUNT
    // ================================

    let loanAmount =
        price - downpayment - rebate;


    if (loanAmount < 0) {
        loanAmount = 0;
    }


    // ================================
    // INTEREST
    // ================================

    let totalInterest =
        loanAmount *
        (interest / 100) *
        tenure;


    let totalLoan =
        loanAmount + totalInterest;


    // ================================
    // MONTHLY
    // ================================

    let monthly =
        totalLoan /
        (tenure * 12);


    // ================================
    // PAPARKAN
    // ================================

    document.getElementById("loanAmount").textContent =
        formatRM(loanAmount);

    document.getElementById("monthly").textContent =
        formatRM(monthly);

}


// CALCULATOR INPUT
document.getElementById("downpayment")
    .addEventListener("input", calculateLoan);

document.getElementById("downpaymentType")
    .addEventListener("change", calculateLoan);

document.getElementById("rebate")
    .addEventListener("input", calculateLoan);

document.getElementById("tenure")
    .addEventListener("change", calculateLoan);


// SEMAK KELAYAKAN
const salaryInput =
    document.getElementById("salary");

const searchInput =
    document.getElementById("search");

const resultBox =
    document.getElementById("result");


salaryInput.addEventListener(
    "input",
    checkEligibility
);

searchInput.addEventListener(
    "input",
    checkEligibility
);


// CHECK ELIGIBILITY
function checkEligibility() {
    console.log("CHECK JALAN");

    let salary = Number(salaryInput.value) || 0;

    let keyword = searchInput.value
        .toLowerCase()
        .trim();

    // Kalau kedua-dua input kosong, kosongkan result
    if (salary === 0 && keyword === "") {
        resultBox.innerHTML = "";
        return;
    }

    let minimumBalance = 1300;

    let html = "";

    cars.forEach(car => {
        car.variants
            .filter(variant => variant.status === "Active")
            .forEach(variant => {

                if (variant.price > 0) {

                    let loanAmount = Number(variant.price);
                    let interest = Number(variant.interest) || 0;
                    let year = Number(variant.loanYear) || 9;

                    let totalInterest =
                        loanAmount *
                        (interest / 100) *
                        year;

                    let monthly =
                        (loanAmount + totalInterest) /
                        (year * 12);

                    let balance = salary - monthly;

                    let salaryOK =
                        salary === 0 ||
                        (
                        salary >= (Number(variant.minSalary) || 0) &&
                        balance >= minimumBalance
                        );

                    let searchOK = true;

                    if (keyword !== "") {
                    searchOK = car.family
                        .toLowerCase()
                        .startsWith(keyword);
                    }

                    if (salaryOK && searchOK) {

                        html += `
                            <div class="car-result">

                                <h3>
                                    🚗 ${car.family}
                                </h3>

                                <p>
                                    ${variant.name}
                                </p>

                               <p class="monthly">
                                   💰 ${monthly.toFixed(0)} / bulan
                               </p>

                               <p>
                                   ✅ <strong>LAYAK</strong>
                               </p>

                               <button
                                   onclick="selectCar('${car.family}', '${variant.name}')"
                               >
                                   Pilih Kereta
                               </button>

                           </div>
                        `;
                    }
                }
            });
    });

    if (html === "") {
        html = `
            <p>
                ❌ Tiada kereta dalam bajet ini.
            </p>
        `;
    }

    resultBox.innerHTML = html;
}


// SELECT CAR
function selectCar(family, variant) {

    console.log("SELECTCAR MASUK");
    console.log("FAMILY:", family);
    console.log("VARIANT:", variant);


    familySelect.value = family;

    familySelect.dispatchEvent(
        new Event("change")
    );


    setTimeout(() => {

        variantSelect.value = variant;

        variantSelect.dispatchEvent(
            new Event("change")
        );

    }, 300);
}


// WHATSAPP
function sendWhatsApp() {

    let phone =
        document.getElementById("customerPhone").value;

    phone =
        formatPhone(phone);


    if (!phone) {

        alert(
            "Masukkan nombor WhatsApp customer"
        );

        return;
    }


    let model =
        familySelect
            .options[familySelect.selectedIndex]
            .textContent;


    let variant =
        variantSelect
            .options[variantSelect.selectedIndex]
            .textContent;


    let monthly =
        document.getElementById("monthly")
            .textContent;


    let price =
        formatRM(
            document.getElementById("price").value
        );


    // DOWNPAYMENT
    let downpaymentValue =
        Number(
            document.getElementById("downpayment").value
        ) || 0;


    let downpaymentType =
        document.getElementById("downpaymentType").value;


    let downpaymentRM =
        downpaymentValue;


    if (downpaymentType === "percent") {

        downpaymentRM =
            Number(
                document.getElementById("price").value
            ) *
            (downpaymentValue / 100);
    }


    let downpayment =
        formatRM(downpaymentRM);


    let downpaymentDisplay =
        downpayment;


    if (downpaymentType === "percent") {

        downpaymentDisplay =
            downpaymentValue +
            "% (" +
            downpayment +
            ")";
    }


    // REBATE
    let rebate =
        formatRM(
            document.getElementById("rebate").value || 0
        );


    // TENURE
    let tenure =
        document.getElementById("tenure").value;


    // WHATSAPP MESSAGE
    let message =
    "Salam Tuan/Puan\n\n" +

    "Seperti perbincangan tadi, saya sediakan anggaran quotation untuk Tuan/Puan:\n\n" +

    "Model:\n" +
    model + "\n\n" +

    "Variant:\n" +
    variant + "\n\n" +

    "Harga OTR:\n" +
    price + "\n\n" +

    "Downpayment:\n" +
    downpaymentDisplay + "\n\n" +

    "Rebate:\n" +
    rebate + "\n\n" +

    "Tempoh:\n" +
    tenure + " Tahun\n\n" +

    "Anggaran Bulanan:\n" +
    monthly + "\n\n" +

    "Saya boleh bantu semak kelayakan dan proses permohonan seterusnya.\n\n" +

    "Jika ada apa-apa pertanyaan boleh terus reply WhatsApp ini ya.\n\n" +

    "Terima kasih\n\n" +

    "Ella\n\n" +

    "Sales Advisor Proton";


let whatsapp =
    "https://wa.me/" +
    phone +
    "?text=" +
    encodeURIComponent(message);


    window.open(
        whatsapp,
        "_blank"
    );
}


// FORMAT PHONE
function formatPhone(phone) {

    phone =
        phone.replace(/\D/g, "");


    if (phone.startsWith("0")) {

        phone =
            "60" +
            phone.substring(1);
    }


    return phone;
}


// CUSTOMER BARU / RESET
function resetCustomer() {

    document.getElementById("salary").value = "";

    document.getElementById("search").value = "";

    document.getElementById("customerPhone").value = "";


    familySelect.value = "";


    variantSelect.innerHTML = `
        <option value="">
            Pilih Variant
        </option>
    `;


    document.getElementById("price").value = "";

    document.getElementById("interest").textContent = "-";

    document.getElementById("loanAmount").textContent =
        "0.00";

    document.getElementById("monthly").textContent =
        "0.00";


    document.getElementById("downpayment").value = "";

    document.getElementById("rebate").value = "";


    document.getElementById("downpaymentType").value =
        "rm";


    document.getElementById("whatsappBtn").disabled =
        true;


    currentVariant = null;


    resultBox.innerHTML = `
        <p class="info">
            Masukkan gaji bersih untuk semak kelayakan.
        </p>
    `;
}