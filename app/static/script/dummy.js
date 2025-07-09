function generatePraiseList(count) {
    return Array.from({ length: count }, (_, i) => ({
        from: `사용자${String.fromCharCode(65 + i % 10)}`,
        to: `사용자${String.fromCharCode(75 + i % 10)}`,
        context: `칭찬 내용 ${i + 1}`,
        empathy: Math.floor(Math.random() * 100),
        date: getRandomDateString('2025-06-27', '2025-07-03')
    }));
}

function getRandomDateString(start, end) {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const randomTime = startTime + Math.random() * (endTime - startTime);
    return new Date(randomTime).toISOString().slice(0, 10);
}