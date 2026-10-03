
// Load Data from Local Storage

const books = JSON.parse(
    localStorage.getItem("sl_books") || "[]"
);

const members = JSON.parse(
    localStorage.getItem("sl_members") || "[]"
);

const tx = JSON.parse(
    localStorage.getItem("sl_tx") || "[]"
);


// Generate Next IDs


let nextBook = +(
    localStorage.getItem("sl_nb") || 1
);

let nextMember = +(
    localStorage.getItem("sl_nm") || 1
);


// // Save Data

const save = () => {

    localStorage.setItem(
        "sl_books",
        JSON.stringify(books)
    );

    localStorage.setItem(
        "sl_members",
        JSON.stringify(members)
    );

    localStorage.setItem(
        "sl_tx",
        JSON.stringify(tx)
    );

    localStorage.setItem(
        "sl_nb",
        nextBook
    );

    localStorage.setItem(
        "sl_nm",
        nextMember
    );

    render();
};


// Render / Display Data

function render() {

    // Dashboard Counts
    bookCount.textContent = books.reduce(
        (s, b) => s + b.qty,
        0
    );

    memberCount.textContent = members.length;

    issuedCount.textContent = tx.filter(
        t => t.status === "Issued"
    ).length;

    availableCount.textContent = books.reduce(
        (s, b) => s + b.available,
        0
    );


    // Book Search
    
    const q = (
        bookSearch.value || ""
    ).toLowerCase();


    // Book Table
    
    bookTable.innerHTML = books
        .filter(
            b =>
                (
                    b.title + " " + b.author
                )
                .toLowerCase()
                .includes(q)
        )
        .map(
            b => `
                <tr>
                    <td>${b.id}</td>
                    <td>${b.title}</td>
                    <td>${b.author}</td>
                    <td>${b.qty}</td>
                    <td>${b.available}</td>

                    <td>
                        <button
                            class="danger"
                            onclick="delBook(${b.id})"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            `
        )
        .join("")
        ||
        `
            <tr>
                <td colspan="6">
                    No books found.
                </td>
            </tr>
        `;


    // Member Table
    
    memberTable.innerHTML = members
        .map(
            m => `
                <tr>
                    <td>${m.id}</td>
                    <td>${m.name}</td>
                    <td>${m.email}</td>

                    <td>
                        <button
                            class="danger"
                            onclick="delMember(${m.id})"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            `
        )
        .join("")
        ||
        `
            <tr>
                <td colspan="4">
                    No members registered.
                </td>
            </tr>
        `;


    // Issue Book Dropdown
    
    issueBook.innerHTML = books
        .filter(b => b.available > 0)
        .map(
            b => `
                <option value="${b.id}">
                    ${b.title} (${b.available})
                </option>
            `
        )
        .join("");


    // Member Dropdown
    
    issueMember.innerHTML = members
        .map(
            m => `
                <option value="${m.id}">
                    ${m.name}
                </option>
            `
        )
        .join("");


    // Transaction Table
    
    transactionTable.innerHTML = tx
        .map(
            (t, i) => `
                <tr>

                    <td>${t.book}</td>

                    <td>${t.member}</td>

                    <td>${t.date}</td>

                    <td>${t.status}</td>

                    <td>
                        ${
                            t.status === "Issued"
                                ? `
                                    <button
                                        onclick="returnBook(${i})"
                                    >
                                        Return
                                    </button>
                                `
                                : "—"
                        }
                    </td>

                </tr>
            `
        )
        .join("")
        ||
        `
            <tr>
                <td colspan="5">
                    No transactions yet.
                </td>
            </tr>
        `;
}


// Add New Book

bookForm.onsubmit = e => {

    e.preventDefault();

    let qty = +bookQty.value;

    books.push({

        id: nextBook++,

        title: bookTitle.value.trim(),

        author: bookAuthor.value.trim(),

        qty: qty,

        available: qty

    });

    e.target.reset();

    bookQty.value = 1;

    save();
};


// Register New Member

memberForm.onsubmit = e => {

    e.preventDefault();

    members.push({

        id: nextMember++,

        name: memberName.value.trim(),

        email: memberEmail.value.trim()

    });

    e.target.reset();

    save();
};


// Issue Book

issueForm.onsubmit = e => {

    e.preventDefault();

    let b = books.find(
        x => x.id == issueBook.value
    );

    let m = members.find(
        x => x.id == issueMember.value
    );


    if (!b || !m) {
        return alert(
            "Please add a book and member first."
        );
    }


    if (b.available < 1) {
        return alert(
            "Book is not available."
        );
    }


    b.available--;


    tx.push({

        book: b.title,

        member: m.name,

        date: new Date().toLocaleDateString(
            "en-IN"
        ),

        status: "Issued"

    });


    save();
};


// Return Book

function returnBook(i) {

    let b = books.find(
        x => x.title === tx[i].book
    );

    if (b) {
        b.available++;
    }

    tx[i].status = "Returned";

    save();
}


// Delete Book

function delBook(id) {

    let b = books.find(
        x => x.id === id
    );


    if (b && b.available === b.qty) {

        books.splice(
            books.indexOf(b),
            1
        );

        save();

    } else {

        alert(
            "Return all issued copies before deleting this book."
        );
    }
}


// Delete Member

function delMember(id) {

    let m = members.find(
        x => x.id === id
    );


    if (
        tx.some(
            t =>
                t.member === m?.name &&
                t.status === "Issued"
        )
    ) {

        return alert(
            "Member has an issued book."
        );
    }


    let i = members.indexOf(m);


    if (i >= 0) {

        members.splice(i, 1);

        save();
    }
}


// Book Search Event

bookSearch.oninput = render;


// Initial Page Load

render();