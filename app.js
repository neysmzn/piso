const STORAGE_KEY = 'product-status-updates';

const form = document.getElementById('status-form');
const list = document.getElementById('updates-list');
const emptyState = document.getElementById('empty-state');
const clearButton = document.getElementById('clear-updates');
const template = document.getElementById('update-item-template');

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
    reader.readAsDataURL(file);
  });

const getStoredUpdates = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];

    const parsed = JSON.parse(storedData);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveUpdates = (updates) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const renderUpdates = () => {
  const updates = getStoredUpdates();
  list.innerHTML = '';

  emptyState.classList.toggle('hidden', updates.length > 0);

  updates.forEach((update) => {
    const item = template.content.firstElementChild.cloneNode(true);

    item.querySelector('.product').textContent = update.productName;
    item.querySelector('.status').textContent = update.status;
    item.querySelector('.meta').textContent = `${update.authorName} · ${formatDate(update.createdAt)}`;

    const noteElement = item.querySelector('.note');
    if (update.note) {
      noteElement.textContent = update.note;
    } else {
      noteElement.classList.add('hidden');
    }

    const gallery = item.querySelector('.gallery');
    if (Array.isArray(update.images) && update.images.length > 0) {
      update.images.forEach((imageData, index) => {
        const img = document.createElement('img');
        img.src = imageData;
        img.alt = `Imagen adjunta ${index + 1} de ${update.productName}`;
        img.loading = 'lazy';
        gallery.append(img);
      });
    } else {
      gallery.classList.add('hidden');
    }

    list.append(item);
  });
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const files = document.getElementById('status-images').files;

  const images = await Promise.all(Array.from(files).map(readFileAsDataUrl));

  const newUpdate = {
    productName: formData.get('productName').trim(),
    status: formData.get('status').trim(),
    authorName: formData.get('authorName').trim(),
    note: formData.get('note').trim(),
    images,
    createdAt: new Date().toISOString(),
  };

  const updates = [newUpdate, ...getStoredUpdates()];
  saveUpdates(updates);

  form.reset();
  renderUpdates();
});

clearButton.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  renderUpdates();
});

renderUpdates();
