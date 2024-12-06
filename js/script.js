
// Handle Form Submission
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bookingForm");
  if (!form) {
      console.error("Form with ID 'bookingForm' not found.");
      return;
  }

  form.addEventListener("submit", (e) => {
      e.preventDefault();

      try {
          // Ambil data dari form
          const name = document.getElementById('name').value;
          const phone = document.getElementById('phone').value;
          const serviceType = document.getElementById("serviceType").value;
          const location = document.getElementById("location").value;
          const date = document.getElementById("date").value;
          const notes = document.getElementById('notes').value;

          if (!name || !phone || !serviceType || !location || !date) {
              alert("Semua field wajib diisi!");
              return;
          }

          const booking = {
              name,
              phone,
              serviceType,
              location,
              date,
              notes,
              id: new Date().getTime(), // ID unik untuk setiap booking
          };

          // Simpan ke LocalStorage
          let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
          bookings.push(booking);
          localStorage.setItem("bookings", JSON.stringify(bookings));

          alert("Terima Kasih - Pesanan berhasil disimpan!");
          displayBookings();
      } catch (error) {
          console.error("Error handling form submission:", error);
          alert("Terjadi kesalahan saat memproses pemesanan.");
      }
  });

  // Tampilkan Daftar Pemesanan
  displayBookings();
});

function displayBookings() {
  const bookingsList = document.getElementById("bookingsList");
  if (!bookingsList) {
      console.error("Element with ID 'bookingsList' not found.");
      return;
  }

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookingsList.innerHTML = bookings.length
      ? bookings
            .map(
                (booking) => `
          <div class="booking-item">
              <p><strong>Nama Pemesan:</strong> ${booking.name}</p>
              <p><strong>Nomor HP:</strong> ${booking.phone}</p>
              <p><strong>Layanan:</strong> ${booking.serviceType}</p>
              <p><strong>Lokasi:</strong> ${booking.location}</p>
              <p><strong>Tanggal:</strong> ${booking.date}</p>
              <p><strong>Catatan:</strong> ${booking.notes || "Tidak ada catatan"}</p>
              <button onclick="deleteBooking(${booking.id})">Hapus</button>
          </div>
          <hr>`
            )
            .join("")
      : "<p>Belum ada pemesanan.</p>";
}

function deleteBooking(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus pemesanan ini?")) return;

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const updatedBookings = bookings.filter((booking) => booking.id !== id);
  localStorage.setItem("bookings", JSON.stringify(updatedBookings));
  displayBookings();
}

function renderBookingHTML(booking) {
    return `
        <div class="booking-item">
            <p><strong>Nama Pemesan:</strong> ${booking.name}</p>
            <p><strong>Nomor HP:</strong> ${booking.phone}</p>
            <p><strong>Layanan:</strong> ${booking.serviceType}</p>
            <p><strong>Lokasi:</strong> ${booking.location}</p>
            <p><strong>Tanggal:</strong> ${booking.date}</p>
            <p><strong>Catatan:</strong> ${booking.notes || "Tidak ada catatan"}</p>
            <button onclick="deleteBooking(${booking.id})" class="delete-btn">Hapus</button>
        </div>`;
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

let bookings = getFromLocalStorage("bookings");
bookings.push(booking);
saveToLocalStorage("bookings", bookings);