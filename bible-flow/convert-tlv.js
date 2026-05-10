const fs = require('fs');

// Book name mapping from TLV to book number
const BOOK_MAP = {
  // Old Testament (1-39)
  'Genesis': 1, 'Exodus': 2, 'Leviticus': 3, 'Numbers': 4, 'Deuteronomy': 5,
  'Joshua': 6, 'Judges': 7, 'Ruth': 8,
  '1_Samuel': 9, '2_Samuel': 10,
  '1_Kings': 11, '2_Kings': 12,
  '1_Chronicles': 13, '2_Chronicles': 14,
  'Ezra': 15, 'Nehemiah': 16, 'Esther': 17,
  'Job': 18, 'Psalm': 19, 'Proverbs': 20, 'Ecclesiastes': 21, 'Song_of_Solomon': 22,
  'Isaiah': 23, 'Jeremiah': 24, 'Lamentations': 25, 'Ezekiel': 26, 'Daniel': 27,
  'Hosea': 28, 'Joel': 29, 'Amos': 30, 'Obadiah': 31, 'Jonah': 32,
  'Micah': 33, 'Nahum': 34, 'Habakkuk': 35, 'Zephaniah': 36, 'Haggai': 37, 'Zechariah': 38, 'Malachi': 39,
  // New Testament (40-66)
  'Matthew': 40, 'Mark': 41, 'Luke': 42, 'John': 43, 'Acts': 44,
  'Romans': 45, '1_Corinthians': 46, '2_Corinthians': 47,
  'Galatians': 48, 'Ephesians': 49, 'Philippians': 50, 'Colossians': 51,
  '1_Thessalonians': 52, '2_Thessalonians': 53,
  '1_Timothy': 54, '2_Timothy': 55, 'Titus': 56, 'Philemon': 57,
  'Hebrews': 58, 'James': 59, '1_Peter': 60, '2_Peter': 61,
  '1_John': 62, '2_John': 63, '3_John': 64, 'Jude': 65, 'Revelation': 66
};

function convertTLVtoBibleFormat(tlvData) {
  const result = { Book: [] };

  // Process Old Testament
  if (tlvData['Old Testament']) {
    for (const [bookName, chapters] of Object.entries(tlvData['Old Testament'])) {
      const bookNum = BOOK_MAP[bookName];
      if (!bookNum || bookNum > 39) continue;
      addBook(result.Book, bookNum, bookName, chapters);
    }
  }

  // Process New Testament
  if (tlvData['New Testament']) {
    for (const [bookName, chapters] of Object.entries(tlvData['New Testament'])) {
      const bookNum = BOOK_MAP[bookName];
      if (!bookNum || bookNum < 40) continue;
      addBook(result.Book, bookNum, bookName, chapters);
    }
  }

  // Sort books by number
  result.Book.sort((a, b) => a.Bookid - b.Bookid);

  return result;
}

function addBook(books, bookNum, bookName, chapters) {
  const book = {
    Bookid: bookNum,
    Bookname: bookName.replace(/_/g, ' '),
    Chapter: []
  };

  // Sort chapters numerically
  const chapterNums = Object.keys(chapters).map(Number).sort((a, b) => a - b);

  for (const chapterNum of chapterNums) {
    const versesObj = chapters[chapterNum];
    const verseList = [];

    // Sort verses numerically
    const verseNums = Object.keys(versesObj).map(Number).sort((a, b) => a - b);

    for (const verseNum of verseNums) {
      // Generate Verseid: BBCCVVV format (e.g., 1001001 = Genesis 1:1)
      const verseid = String(bookNum).padStart(2, '0') +
                     String(chapterNum).padStart(2, '0') +
                     String(verseNum).padStart(3, '0');

      verseList.push({
        Verseid: verseid,
        Verse: versesObj[verseNum]
      });
    }

    book.Chapter.push({ Verse: verseList });
  }

  books.push(book);
}

// Read TLV file
const tlvData = JSON.parse(fs.readFileSync('./TLV_Bible.json', 'utf8'));

// Convert
const bibleData = convertTLVtoBibleFormat(tlvData);

// Write output
fs.writeFileSync('./english-bible.json', JSON.stringify(bibleData, null, 2));

console.log(`Converted ${bibleData.Book.length} books`);
console.log('Output: english-bible.json');