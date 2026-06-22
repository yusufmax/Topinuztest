const { Product } = require('./models');
const { Op } = require('sequelize');

async function run() {
    try {
        console.log('Running duplicate products cleanup...');
        const count = await Product.destroy({
            where: {
                ShopId: { [Op.gt]: 1 },
                name: [
                    'Современный модульный диван',
                    'Велюровое кресло для отдыха',
                    'Обеденный стол из массива дуба',
                    'Журнальный столик в стиле лофт',
                    'Двуспальная кровать с мягким изголовьем',
                    'Шкаф-купе с зеркальными дверями',
                    'Плетеный комплект садовой мебели'
                ]
            }
        });
        console.log(`Deleted ${count} duplicate products successfully.`);
        process.exit(0);
    } catch (e) {
        console.error('Cleanup failed:', e);
        process.exit(1);
    }
}

run();
