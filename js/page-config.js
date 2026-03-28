/**
 * 页面配置管理器
 * 支持多页面扩展的配置系统
 */

class PageConfigManager {
    constructor() {
        // 页面配置映射表 - 改为按页面分类
        this.pageConfigs = {
            // 第7页 - Sections 1.1 + 1.2 + 1.3
            7: {
                pageNumber: 7,
                sections: ["1.1", "1.2", "1.3"],
                dataFile: "extracted_words/extracted_words_page7.json",
                imageFile: "images/page7.png",
                title: "Sections 1.1 + 1.2 + 1.3",
                description: "第7页词汇",
                primarySection: "1.1"
            },
            
            // 第8页 - Sections 2.1 + 2.2 + 2.3
            8: {
                pageNumber: 8,
                sections: ["2.1", "2.2", "2.3"],
                dataFile: "extracted_words/extracted_words_page8.json",
                imageFile: "images/page8.png",
                title: "Sections 2.1 + 2.2 + 2.3",
                description: "第8页词汇",
                primarySection: "2.1"
            },
            
            // 第9页 - Sections 3.1 + 3.2 + 3.3
            9: {
                pageNumber: 9,
                sections: ["3.1", "3.2", "3.3"],
                dataFile: "extracted_words/extracted_words_page9.json",
                imageFile: "images/page9.png",
                title: "Sections 3.1 + 3.2 + 3.3",
                description: "第9页词汇",
                primarySection: "3.1"
            },
            
            // 第10页 - Sections 4.1 + 4.2 + 4.3 + 4.4
            10: {
                pageNumber: 10,
                sections: ["4.1", "4.2", "4.3", "4.4"],
                dataFile: "extracted_words/extracted_words_page10.json",
                imageFile: "images/page10.png",
                title: "Sections 4.1 + 4.2 + 4.3 + 4.4",
                description: "第10页词汇",
                primarySection: "4.1"
            },
            
            // 第11页 - Sections 5.1 + 5.2 + 5.3 + 5.4
            11: {
                pageNumber: 11,
                sections: ["5.1", "5.2", "5.3", "5.4"],
                dataFile: "extracted_words/extracted_words_page11.json",
                imageFile: "images/page11.png",
                title: "Sections 5.1 + 5.2 + 5.3 + 5.4",
                description: "第11页词汇",
                primarySection: "5.1"
            },
            
            // 第12页 - Section 6.1
            12: {
                pageNumber: 12,
                sections: ["6.1"],
                dataFile: "extracted_words/extracted_words_page12.json",
                imageFile: "images/page12.png",
                title: "Section 6.1",
                description: "第12页词汇",
                primarySection: "6.1"
            },
            
            // 第13页 - Sections 7.1 + 7.2 + 7.3
            13: {
                pageNumber: 13,
                sections: ["7.1", "7.2", "7.3"],
                dataFile: "extracted_words/extracted_words_page13.json",
                imageFile: "images/page13.png",
                title: "Sections 7.1 + 7.2 + 7.3",
                description: "第13页词汇",
                primarySection: "7.1"
            },
            
            // 第14页 - Sections 8.1 + 8.2 + 8.3
            14: {
                pageNumber: 14,
                sections: ["8.1", "8.2", "8.3"],
                dataFile: "extracted_words/extracted_words_page14.json",
                imageFile: "images/page14.png",
                title: "Sections 8.1 + 8.2 + 8.3",
                description: "第14页词汇",
                primarySection: "8.1"
            },
            
            // 第15页 - Sections 9.1 + 9.2 + 9.3
            15: {
                pageNumber: 15,
                sections: ["9.1", "9.2", "9.3"],
                dataFile: "extracted_words/extracted_words_page15.json",
                imageFile: "images/page15.png",
                title: "Sections 9.1 + 9.2 + 9.3",
                description: "第15页词汇",
                primarySection: "9.1"
            },
            
            // 第16页 - Section 10.1
            16: {
                pageNumber: 16,
                sections: ["10.1"],
                dataFile: "extracted_words/extracted_words_page16.json",
                imageFile: "images/page16.png",
                title: "Section 10.1",
                description: "第16页词汇",
                primarySection: "10.1"
            },
            
            // 第17页 - Section 11.1
            17: {
                pageNumber: 17,
                sections: ["11.1"],
                dataFile: "extracted_words/extracted_words_page17.json",
                imageFile: "images/page17.png",
                title: "Section 11.1",
                description: "第17页词汇",
                primarySection: "11.1"
            },
            
            // 第18页 - Sections 12.1 + 12.2
            18: {
                pageNumber: 18,
                sections: ["12.1", "12.2"],
                dataFile: "extracted_words/extracted_words_page18.json",
                imageFile: "images/page18.png",
                title: "Sections 12.1 + 12.2",
                description: "第18页词汇",
                primarySection: "12.1"
            },
            
            // 第19页 - Sections 13.1 + 13.2 + 13.3
            19: {
                pageNumber: 19,
                sections: ["13.1", "13.2", "13.3"],
                dataFile: "extracted_words/extracted_words_page19.json",
                imageFile: "images/page19.png",
                title: "Sections 13.1 + 13.2 + 13.3",
                description: "第19页词汇",
                primarySection: "13.1"
            },
            
            // 第20页 - Sections 14.1 + 14.2 + 14.3 + 14.4
            20: {
                pageNumber: 20,
                sections: ["14.1", "14.2", "14.3", "14.4"],
                dataFile: "extracted_words/extracted_words_page20.json",
                imageFile: "images/page20.png",
                title: "Sections 14.1 + 14.2 + 14.3 + 14.4",
                description: "第20页词汇",
                primarySection: "14.1"
            },
            
            // 第21页 - Sections 15.1 + 15.2 + 15.3 + 15.4
            21: {
                pageNumber: 21,
                sections: ["15.1", "15.2", "15.3", "15.4"],
                dataFile: "extracted_words/extracted_words_page21.json",
                imageFile: "images/page21.png",
                title: "Sections 15.1 + 15.2 + 15.3 + 15.4",
                description: "第21页词汇",
                primarySection: "15.1"
            },
            
            // 第22页 - Sections 16.1 + 16.2 + 16.3 + 16.4
            22: {
                pageNumber: 22,
                sections: ["16.1", "16.2", "16.3", "16.4"],
                dataFile: "extracted_words/extracted_words_page22.json",
                imageFile: "images/page22.png",
                title: "Sections 16.1 + 16.2 + 16.3 + 16.4",
                description: "第22页词汇",
                primarySection: "16.1"
            },
            
            // 第23页 - Sections 17.1 + 17.2 + 17.3
            23: {
                pageNumber: 23,
                sections: ["17.1", "17.2", "17.3"],
                dataFile: "extracted_words/extracted_words_page23.json",
                imageFile: "images/page23.png",
                title: "Sections 17.1 + 17.2 + 17.3",
                description: "第23页词汇",
                primarySection: "17.1"
            },
            
            // 第24页 - Sections 18.1 + 18.2 + 18.3 + 18.4
            24: {
                pageNumber: 24,
                sections: ["18.1", "18.2", "18.3", "18.4"],
                dataFile: "extracted_words/extracted_words_page24.json",
                imageFile: "images/page24.png",
                title: "Sections 18.1 + 18.2 + 18.3 + 18.4",
                description: "第24页词汇",
                primarySection: "18.1"
            },
            
            // 第25页 - Sections 19.1 + 19.2
            25: {
                pageNumber: 25,
                sections: ["19.1", "19.2"],
                dataFile: "extracted_words/extracted_words_page25.json",
                imageFile: "images/page25.png",
                title: "Sections 19.1 + 19.2",
                description: "第25页词汇",
                primarySection: "19.1"
            },
            
            // 第26页 - Sections 20.1 + 20.2 + 20.3
            26: {
                pageNumber: 26,
                sections: ["20.1", "20.2", "20.3"],
                dataFile: "extracted_words/extracted_words_page26.json",
                imageFile: "images/page26.png",
                title: "Sections 20.1 + 20.2 + 20.3",
                description: "第26页词汇",
                primarySection: "20.1"
            },
            
            // 第27页 - Sections 21.1 + 21.2
            27: {
                pageNumber: 27,
                sections: ["21.1", "21.2"],
                dataFile: "extracted_words/extracted_words_page27.json",
                imageFile: "images/page27.png",
                title: "Sections 21.1 + 21.2",
                description: "第27页词汇",
                primarySection: "21.1"
            },
            
            // 第28页 - Sections 22.1 + 22.2
            28: {
                pageNumber: 28,
                sections: ["22.1", "22.2"],
                dataFile: "extracted_words/extracted_words_page28.json",
                imageFile: "images/page28.png",
                title: "Sections 22.1 + 22.2",
                description: "第28页词汇",
                primarySection: "22.1"
            },
            
            // 第29页 - Sections 23.1 + 23.2
            29: {
                pageNumber: 29,
                sections: ["23.1", "23.2"],
                dataFile: "extracted_words/extracted_words_page29.json",
                imageFile: "images/page29.png",
                title: "Sections 23.1 + 23.2",
                description: "第29页词汇",
                primarySection: "23.1"
            },
            
            // 第30页 - Sections 24.1 + 24.2
            30: {
                pageNumber: 30,
                sections: ["24.1", "24.2"],
                dataFile: "extracted_words/extracted_words_page30.json",
                imageFile: "images/page30.png",
                title: "Sections 24.1 + 24.2",
                description: "第30页词汇",
                primarySection: "24.1"
            },
            
            // 第31页 - Sections 25.1 + 25.2
            31: {
                pageNumber: 31,
                sections: ["25.1", "25.2"],
                dataFile: "extracted_words/extracted_words_page31.json",
                imageFile: "images/page31.png",
                title: "Sections 25.1 + 25.2",
                description: "第31页词汇",
                primarySection: "25.1"
            },
            
            // 第32页 - Sections 26.1 + 26.2
            32: {
                pageNumber: 32,
                sections: ["26.1", "26.2"],
                dataFile: "extracted_words/extracted_words_page32.json",
                imageFile: "images/page32.png",
                title: "Sections 26.1 + 26.2",
                description: "第32页词汇",
                primarySection: "26.1"
            },
            
            // 第33页 - Sections 27.1 + 27.2
            33: {
                pageNumber: 33,
                sections: ["27.1", "27.2"],
                dataFile: "extracted_words/extracted_words_page33.json",
                imageFile: "images/page33.png",
                title: "Sections 27.1 + 27.2",
                description: "第33页词汇",
                primarySection: "27.1"
            },
            
            // 第34页 - Section 28.1
            34: {
                pageNumber: 34,
                sections: ["28.1"],
                dataFile: "extracted_words/extracted_words_page34.json",
                imageFile: "images/page34.png",
                title: "Section 28.1",
                description: "第34页词汇",
                primarySection: "28.1"
            },
            
            // 第35页 - Sections 29.1 + 29.2
            35: {
                pageNumber: 35,
                sections: ["29.1", "29.2"],
                dataFile: "extracted_words/extracted_words_page35.json",
                imageFile: "images/page35.png",
                title: "Sections 29.1 + 29.2",
                description: "第35页词汇",
                primarySection: "29.1"
            },
            
            // 第36页 - Sections 30.1 + 30.2
            36: {
                pageNumber: 36,
                sections: ["30.1", "30.2"],
                dataFile: "extracted_words/extracted_words_page36.json",
                imageFile: "images/page36.png",
                title: "Sections 30.1 + 30.2",
                description: "第36页词汇",
                primarySection: "30.1"
            },
            
            // 第37页 - Section 31.1
            37: {
                pageNumber: 37,
                sections: ["31.1"],
                dataFile: "extracted_words/extracted_words_page37.json",
                imageFile: "images/page37.png",
                title: "Section 31.1",
                description: "第37页词汇",
                primarySection: "31.1"
            },
            
            // 第38页 - Sections 32.1 + 32.2
            38: {
                pageNumber: 38,
                sections: ["32.1", "32.2"],
                dataFile: "extracted_words/extracted_words_page38.json",
                imageFile: "images/page38.png",
                title: "Sections 32.1 + 32.2",
                description: "第38页词汇",
                primarySection: "32.1"
            },
            
            // 第39页 - Sections 33.1 + 33.2 + 33.3
            39: {
                pageNumber: 39,
                sections: ["33.1", "33.2", "33.3"],
                dataFile: "extracted_words/extracted_words_page39.json",
                imageFile: "images/page39.png",
                title: "Sections 33.1 + 33.2 + 33.3",
                description: "第39页词汇",
                primarySection: "33.1"
            },
            
            // 第40页 - Sections 34.1 + 34.2
            40: {
                pageNumber: 40,
                sections: ["34.1", "34.2"],
                dataFile: "extracted_words/extracted_words_page40.json",
                imageFile: "images/page40.png",
                title: "Sections 34.1 + 34.2",
                description: "第40页词汇",
                primarySection: "34.1"
            },
            
            // 第41页 - Sections 35.1 + 35.2 + 35.3
            41: {
                pageNumber: 41,
                sections: ["35.1", "35.2", "35.3"],
                dataFile: "extracted_words/extracted_words_page41.json",
                imageFile: "images/page41.png",
                title: "Sections 35.1 + 35.2 + 35.3",
                description: "第41页词汇",
                primarySection: "35.1"
            },
            
            // 第42页 - Sections 36.1 + 36.2 + 36.3
            42: {
                pageNumber: 42,
                sections: ["36.1", "36.2", "36.3"],
                dataFile: "extracted_words/extracted_words_page42.json",
                imageFile: "images/page42.png",
                title: "Sections 36.1 + 36.2 + 36.3",
                description: "第42页词汇",
                primarySection: "36.1"
            },
            
            // 第43页 - Sections 37.1 + 37.2
            43: {
                pageNumber: 43,
                sections: ["37.1", "37.2"],
                dataFile: "extracted_words/extracted_words_page43.json",
                imageFile: "images/page43.png",
                title: "Sections 37.1 + 37.2",
                description: "第43页词汇",
                primarySection: "37.1"
            },
            
            // 第44页 - Sections 38.1 + 38.2 + 38.3
            44: {
                pageNumber: 44,
                sections: ["38.1", "38.2", "38.3"],
                dataFile: "extracted_words/extracted_words_page44.json",
                imageFile: "images/page44.png",
                title: "Sections 38.1 + 38.2 + 38.3",
                description: "第44页词汇",
                primarySection: "38.1"
            },
            
            // 第45页 - Sections 39.1 + 39.2
            45: {
                pageNumber: 45,
                sections: ["39.1", "39.2"],
                dataFile: "extracted_words/extracted_words_page45.json",
                imageFile: "images/page45.png",
                title: "Sections 39.1 + 39.2",
                description: "第45页词汇",
                primarySection: "39.1"
            },
            
            // 第46页 - Sections 40.1 + 40.2
            46: {
                pageNumber: 46,
                sections: ["40.1", "40.2"],
                dataFile: "extracted_words/extracted_words_page46.json",
                imageFile: "images/page46.png",
                title: "Sections 40.1 + 40.2",
                description: "第46页词汇",
                primarySection: "40.1"
            },
            
            // 第47页 - Sections 41.1 + 41.2
            47: {
                pageNumber: 47,
                sections: ["41.1", "41.2"],
                dataFile: "extracted_words/extracted_words_page47.json",
                imageFile: "images/page47.png",
                title: "Sections 41.1 + 41.2",
                description: "第47页词汇",
                primarySection: "41.1"
            },
            
            // 第48页 - Section 42.1
            48: {
                pageNumber: 48,
                sections: ["42.1"],
                dataFile: "extracted_words/extracted_words_page48.json",
                imageFile: "images/page48.png",
                title: "Section 42.1",
                description: "第48页词汇",
                primarySection: "42.1"
            },
            
            // 第49页 - Sections 43.1 + 43.2
            49: {
                pageNumber: 49,
                sections: ["43.1", "43.2"],
                dataFile: "extracted_words/extracted_words_page49.json",
                imageFile: "images/page49.png",
                title: "Sections 43.1 + 43.2",
                description: "第49页词汇",
                primarySection: "43.1"
            },
            
            // 第50页 - Sections 44.1 + 44.2
            50: {
                pageNumber: 50,
                sections: ["44.1", "44.2"],
                dataFile: "extracted_words/extracted_words_page50.json",
                imageFile: "images/page50.png",
                title: "Sections 44.1 + 44.2",
                description: "第50页词汇",
                primarySection: "44.1"
            },
            
            // 第51页 - Sections 45.1 + 45.2 + 45.3
            51: {
                pageNumber: 51,
                sections: ["45.1", "45.2", "45.3"],
                dataFile: "extracted_words/extracted_words_page51.json",
                imageFile: "images/page51.png",
                title: "Sections 45.1 + 45.2 + 45.3",
                description: "第51页词汇",
                primarySection: "45.1"
            },
            
            // 第52页 - Sections 46.1 + 46.2 + 46.3
            52: {
                pageNumber: 52,
                sections: ["46.1", "46.2", "46.3"],
                dataFile: "extracted_words/extracted_words_page52.json",
                imageFile: "images/page52.png",
                title: "Sections 46.1 + 46.2 + 46.3",
                description: "第52页词汇",
                primarySection: "46.1"
            },
            
            // 第53页 - Sections 47.1 + 47.2
            53: {
                pageNumber: 53,
                sections: ["47.1", "47.2"],
                dataFile: "extracted_words/extracted_words_page53.json",
                imageFile: "images/page53.png",
                title: "Sections 47.1 + 47.2",
                description: "第53页词汇",
                primarySection: "47.1"
            },
            
            // 第54页 - Sections 48.1 + 48.2 + 48.3 + 48.4
            54: {
                pageNumber: 54,
                sections: ["48.1", "48.2", "48.3", "48.4"],
                dataFile: "extracted_words/extracted_words_page54.json",
                imageFile: "images/page54.png",
                title: "Sections 48.1 + 48.2 + 48.3 + 48.4",
                description: "第54页词汇",
                primarySection: "48.1"
            },
            
            // 第55页 - Section 49.1
            55: {
                pageNumber: 55,
                sections: ["49.1"],
                dataFile: "extracted_words/extracted_words_page55.json",
                imageFile: "images/page55.png",
                title: "Section 49.1",
                description: "第55页词汇",
                primarySection: "49.1"
            },
            
            // 第56页 - Sections 50.1 + 50.2 + 50.3
            56: {
                pageNumber: 56,
                sections: ["50.1", "50.2", "50.3"],
                dataFile: "extracted_words/extracted_words_page56.json",
                imageFile: "images/page56.png",
                title: "Sections 50.1 + 50.2 + 50.3",
                description: "第56页词汇",
                primarySection: "50.1"
            },
            
            // 第57页 - Sections 51.1 + 51.2
            57: {
                pageNumber: 57,
                sections: ["51.1", "51.2"],
                dataFile: "extracted_words/extracted_words_page57.json",
                imageFile: "images/page57.png",
                title: "Sections 51.1 + 51.2",
                description: "第57页词汇",
                primarySection: "51.1"
            },
            
            // 第58页 - Sections 52.1 + 52.2 + 52.3 + 52.4
            58: {
                pageNumber: 58,
                sections: ["52.1", "52.2", "52.3", "52.4"],
                dataFile: "extracted_words/extracted_words_page58.json",
                imageFile: "images/page58.png",
                title: "Sections 52.1 + 52.2 + 52.3 + 52.4",
                description: "第58页词汇",
                primarySection: "52.1"
            },
            
            // 第59页 - Sections 53.1 + 53.2 + 53.3 + 53.4
            59: {
                pageNumber: 59,
                sections: ["53.1", "53.2", "53.3", "53.4"],
                dataFile: "extracted_words/extracted_words_page59.json",
                imageFile: "images/page59.png",
                title: "Sections 53.1 + 53.2 + 53.3 + 53.4",
                description: "第59页词汇",
                primarySection: "53.1"
            },
            
            // 第60页 - Sections 54.1 + 54.2 + 54.3
            60: {
                pageNumber: 60,
                sections: ["54.1", "54.2", "54.3"],
                dataFile: "extracted_words/extracted_words_page60.json",
                imageFile: "images/page60.png",
                title: "Sections 54.1 + 54.2 + 54.3",
                description: "第60页词汇",
                primarySection: "54.1"
            },
            
            // 第61页 - Sections 55.1 + 55.2
            61: {
                pageNumber: 61,
                sections: ["55.1", "55.2"],
                dataFile: "extracted_words/extracted_words_page61.json",
                imageFile: "images/page61.png",
                title: "Sections 55.1 + 55.2",
                description: "第61页词汇",
                primarySection: "55.1"
            },
            
            // 第62页 - Section 56.1
            62: {
                pageNumber: 62,
                sections: ["56.1"],
                dataFile: "extracted_words/extracted_words_page62.json",
                imageFile: "images/page62.png",
                title: "Section 56.1",
                description: "第62页词汇",
                primarySection: "56.1"
            },
            
            // 第63页 - Sections 57.1 + 57.2 + 57.3
            63: {
                pageNumber: 63,
                sections: ["57.1", "57.2", "57.3"],
                dataFile: "extracted_words/extracted_words_page63.json",
                imageFile: "images/page63.png",
                title: "Sections 57.1 + 57.2 + 57.3",
                description: "第63页词汇",
                primarySection: "57.1"
            },
            
            // 第64页 - Sections 58.1 + 58.2 + 58.3
            64: {
                pageNumber: 64,
                sections: ["58.1", "58.2", "58.3"],
                dataFile: "extracted_words/extracted_words_page64.json",
                imageFile: "images/page64.png",
                title: "Sections 58.1 + 58.2 + 58.3",
                description: "第64页词汇",
                primarySection: "58.1"
            },
            
            // 第65页 - Sections 59.1 + 59.2
            65: {
                pageNumber: 65,
                sections: ["59.1", "59.2"],
                dataFile: "extracted_words/extracted_words_page65.json",
                imageFile: "images/page65.png",
                title: "Sections 59.1 + 59.2",
                description: "第65页词汇",
                primarySection: "59.1"
            },
            
            // 第66页 - Sections 60.1 + 60.2 + 60.3 + 60.4
            66: {
                pageNumber: 66,
                sections: ["60.1", "60.2", "60.3", "60.4"],
                dataFile: "extracted_words/extracted_words_page66.json",
                imageFile: "images/page66.png",
                title: "Sections 60.1 + 60.2 + 60.3 + 60.4",
                description: "第66页词汇",
                primarySection: "60.1"
            },
            
            // 第67页 - Sections 61.1 + 61.2 + 61.3 + 61.4
            67: {
                pageNumber: 67,
                sections: ["61.1", "61.2", "61.3", "61.4"],
                dataFile: "extracted_words/extracted_words_page67.json",
                imageFile: "images/page67.png",
                title: "Sections 61.1 + 61.2 + 61.3 + 61.4",
                description: "第67页词汇",
                primarySection: "61.1"
            },
            
            // 第68页 - Section 62.1
            68: {
                pageNumber: 68,
                sections: ["62.1"],
                dataFile: "extracted_words/extracted_words_page68.json",
                imageFile: "images/page68.png",
                title: "Section 62.1",
                description: "第68页词汇",
                primarySection: "62.1"
            },
            
            // 第69页 - Sections 63.1 + 63.2 + 63.3
            69: {
                pageNumber: 69,
                sections: ["63.1", "63.2", "63.3"],
                dataFile: "extracted_words/extracted_words_page69.json",
                imageFile: "images/page69.png",
                title: "Sections 63.1 + 63.2 + 63.3",
                description: "第69页词汇",
                primarySection: "63.1"
            },
            
            // 第70页 - Sections 64.1 + 64.2
            70: {
                pageNumber: 70,
                sections: ["64.1", "64.2"],
                dataFile: "extracted_words/extracted_words_page70.json",
                imageFile: "images/page70.png",
                title: "Sections 64.1 + 64.2",
                description: "第70页词汇",
                primarySection: "64.1"
            },
            
            // 第71页 - Sections 65.1 + 65.2 + 65.3
            71: {
                pageNumber: 71,
                sections: ["65.1", "65.2", "65.3"],
                dataFile: "extracted_words/extracted_words_page71.json",
                imageFile: "images/page71.png",
                title: "Sections 65.1 + 65.2 + 65.3",
                description: "第71页词汇",
                primarySection: "65.1"
            },
            
            // 第72页 - Sections 66.1 + 67.1
            72: {
                pageNumber: 72,
                sections: ["66.1", "67.1"],
                dataFile: "extracted_words/extracted_words_page72.json",
                imageFile: "images/page72.png",
                title: "Sections 66.1 + 67.1",
                description: "第72页词汇",
                primarySection: "66.1"
            },
            
            // 第73页 - Sections 68.1 + 68.2 + 68.3 + 68.4
            73: {
                pageNumber: 73,
                sections: ["68.1", "68.2", "68.3", "68.4"],
                dataFile: "extracted_words/extracted_words_page73.json",
                imageFile: "images/page73.png",
                title: "Sections 68.1 + 68.2 + 68.3 + 68.4",
                description: "第73页词汇",
                primarySection: "68.1"
            },
            
            // 第74页 - Section 69.1
            74: {
                pageNumber: 74,
                sections: ["69.1"],
                dataFile: "extracted_words/extracted_words_page74.json",
                imageFile: "images/page74.png",
                title: "Section 69.1",
                description: "第74页词汇",
                primarySection: "69.1"
            },
            
            // 第75页 - Section 70.1
            75: {
                pageNumber: 75,
                sections: ["70.1"],
                dataFile: "extracted_words/extracted_words_page75.json",
                imageFile: "images/page75.png",
                title: "Section 70.1",
                description: "第75页词汇",
                primarySection: "70.1"
            },
            
            // 第76页 - Sections 71.1 + 71.2
            76: {
                pageNumber: 76,
                sections: ["71.1", "71.2"],
                dataFile: "extracted_words/extracted_words_page76.json",
                imageFile: "images/page76.png",
                title: "Sections 71.1 + 71.2",
                description: "第76页词汇",
                primarySection: "71.1"
            },
            
            // 第77页 - Sections 72.1 + 72.2
            77: {
                pageNumber: 77,
                sections: ["72.1", "72.2"],
                dataFile: "extracted_words/extracted_words_page77.json",
                imageFile: "images/page77.png",
                title: "Sections 72.1 + 72.2",
                description: "第77页词汇",
                primarySection: "72.1"
            },
            
            // 第78页 - Sections 73.1 + 73.2 + 73.3
            78: {
                pageNumber: 78,
                sections: ["73.1", "73.2", "73.3"],
                dataFile: "extracted_words/extracted_words_page78.json",
                imageFile: "images/page78.png",
                title: "Sections 73.1 + 73.2 + 73.3",
                description: "第78页词汇",
                primarySection: "73.1"
            },
            
            // 第79页 - Sections 74.1 + 74.2 + 74.3 + 74.4 + 74.5 + 74.6
            79: {
                pageNumber: 79,
                sections: ["74.1", "74.2", "74.3", "74.4", "74.5", "74.6"],
                dataFile: "extracted_words/extracted_words_page79.json",
                imageFile: "images/page79.png",
                title: "Sections 74.1 + 74.2 + 74.3 + 74.4 + 74.5 + 74.6",
                description: "第79页词汇",
                primarySection: "74.1"
            },
            
            // 第80页 - Sections 75.1 + 75.2
            80: {
                pageNumber: 80,
                sections: ["75.1", "75.2"],
                dataFile: "extracted_words/extracted_words_page80.json",
                imageFile: "images/page80.png",
                title: "Sections 75.1 + 75.2",
                description: "第80页词汇",
                primarySection: "75.1"
            },
            
            // 第81页 - Section 76.1
            81: {
                pageNumber: 81,
                sections: ["76.1"],
                dataFile: "extracted_words/extracted_words_page81.json",
                imageFile: "images/page81.png",
                title: "Section 76.1",
                description: "第81页词汇",
                primarySection: "76.1"
            },
            
            // 第82页 - Sections 77.1 + 77.2
            82: {
                pageNumber: 82,
                sections: ["77.1", "77.2"],
                dataFile: "extracted_words/extracted_words_page82.json",
                imageFile: "images/page82.png",
                title: "Sections 77.1 + 77.2",
                description: "第82页词汇",
                primarySection: "77.1"
            },
            
            // 第83页 - Section 78.1
            83: {
                pageNumber: 83,
                sections: ["78.1"],
                dataFile: "extracted_words/extracted_words_page83.json",
                imageFile: "images/page83.png",
                title: "Section 78.1",
                description: "第83页词汇",
                primarySection: "78.1"
            },
            
            // 第84页 - Sections 79.1 + 79.2 + 79.3
            84: {
                pageNumber: 84,
                sections: ["79.1", "79.2", "79.3"],
                dataFile: "extracted_words/extracted_words_page84.json",
                imageFile: "images/page84.png",
                title: "Sections 79.1 + 79.2 + 79.3",
                description: "第84页词汇",
                primarySection: "79.1"
            },
            
            // 第85页 - Sections 80.1 + 80.2 + 80.3
            85: {
                pageNumber: 85,
                sections: ["80.1", "80.2", "80.3"],
                dataFile: "extracted_words/extracted_words_page85.json",
                imageFile: "images/page85.png",
                title: "Sections 80.1 + 80.2 + 80.3",
                description: "第85页词汇",
                primarySection: "80.1"
            },
            
            // 第86页 - Sections 81.1 + 81.2
            86: {
                pageNumber: 86,
                sections: ["81.1", "81.2"],
                dataFile: "extracted_words/extracted_words_page86.json",
                imageFile: "images/page86.png",
                title: "Sections 81.1 + 81.2",
                description: "第86页词汇",
                primarySection: "81.1"
            },
            
            // 第87页 - Sections 82.1 + 82.2 + 82.3
            87: {
                pageNumber: 87,
                sections: ["82.1", "82.2", "82.3"],
                dataFile: "extracted_words/extracted_words_page87.json",
                imageFile: "images/page87.png",
                title: "Sections 82.1 + 82.2 + 82.3",
                description: "第87页词汇",
                primarySection: "82.1"
            },
            
            // 第88页 - Sections 83.1 + 83.2
            88: {
                pageNumber: 88,
                sections: ["83.1", "83.2"],
                dataFile: "extracted_words/extracted_words_page88.json",
                imageFile: "images/page88.png",
                title: "Sections 83.1 + 83.2",
                description: "第88页词汇",
                primarySection: "83.1"
            },
            
            // 第89页 - Sections 84.1 + 84.2 + 84.3
            89: {
                pageNumber: 89,
                sections: ["84.1", "84.2", "84.3"],
                dataFile: "extracted_words/extracted_words_page89.json",
                imageFile: "images/page89.png",
                title: "Sections 84.1 + 84.2 + 84.3",
                description: "第89页词汇",
                primarySection: "84.1"
            },
            
            // 第90页 - Sections 85.1 + 85.2
            90: {
                pageNumber: 90,
                sections: ["85.1", "85.2"],
                dataFile: "extracted_words/extracted_words_page90.json",
                imageFile: "images/page90.png",
                title: "Sections 85.1 + 85.2",
                description: "第90页词汇",
                primarySection: "85.1"
            },
            
            // 第91页 - Sections 86.1 + 86.2 + 86.3 + 86.4
            91: {
                pageNumber: 91,
                sections: ["86.1", "86.2", "86.3", "86.4"],
                dataFile: "extracted_words/extracted_words_page91.json",
                imageFile: "images/page91.png",
                title: "Sections 86.1 + 86.2 + 86.3 + 86.4",
                description: "第91页词汇",
                primarySection: "86.1"
            },
            
            // 第92页 - Sections 87.1 + 87.2 + 87.3
            92: {
                pageNumber: 92,
                sections: ["87.1", "87.2", "87.3"],
                dataFile: "extracted_words/extracted_words_page92.json",
                imageFile: "images/page92.png",
                title: "Sections 87.1 + 87.2 + 87.3",
                description: "第92页词汇",
                primarySection: "87.1"
            },
            
            // 第93页 - Sections 88.1 + 88.2 + 88.3 + 88.4 + 88.5
            93: {
                pageNumber: 93,
                sections: ["88.1", "88.2", "88.3", "88.4", "88.5"],
                dataFile: "extracted_words/extracted_words_page93.json",
                imageFile: "images/page93.png",
                title: "Sections 88.1 + 88.2 + 88.3 + 88.4 + 88.5",
                description: "第93页词汇",
                primarySection: "88.1"
            },
            
            // 第94页 - Section 89.1
            94: {
                pageNumber: 94,
                sections: ["89.1"],
                dataFile: "extracted_words/extracted_words_page94.json",
                imageFile: "images/page94.png",
                title: "Section 89.1",
                description: "第94页词汇",
                primarySection: "89.1"
            },
            
            // 第95页 - Section 90.1
            95: {
                pageNumber: 95,
                sections: ["90.1"],
                dataFile: "extracted_words/extracted_words_page95.json",
                imageFile: "images/page95.png",
                title: "Section 90.1",
                description: "第95页词汇",
                primarySection: "90.1"
            },
            
            // 第96页 - Sections 91.1 + 91.2
            96: {
                pageNumber: 96,
                sections: ["91.1", "91.2"],
                dataFile: "extracted_words/extracted_words_page96.json",
                imageFile: "images/page96.png",
                title: "Sections 91.1 + 91.2",
                description: "第96页词汇",
                primarySection: "91.1"
            },
            
            // 第97页 - Sections 92.1 + 92.2 + 92.3
            97: {
                pageNumber: 97,
                sections: ["92.1", "92.2", "92.3"],
                dataFile: "extracted_words/extracted_words_page97.json",
                imageFile: "images/page97.png",
                title: "Sections 92.1 + 92.2 + 92.3",
                description: "第97页词汇",
                primarySection: "92.1"
            },
            
            // 第98页 - Sections 93.1 + 93.2
            98: {
                pageNumber: 98,
                sections: ["93.1", "93.2"],
                dataFile: "extracted_words/extracted_words_page98.json",
                imageFile: "images/page98.png",
                title: "Sections 93.1 + 93.2",
                description: "第98页词汇",
                primarySection: "93.1"
            },
            
            // 第99页 - Sections 94.1 + 94.2
            99: {
                pageNumber: 99,
                sections: ["94.1", "94.2"],
                dataFile: "extracted_words/extracted_words_page99.json",
                imageFile: "images/page99.png",
                title: "Sections 94.1 + 94.2",
                description: "第99页词汇",
                primarySection: "94.1"
            },
            
            // 第100页 - Sections 95.1 + 95.2
            100: {
                pageNumber: 100,
                sections: ["95.1", "95.2"],
                dataFile: "extracted_words/extracted_words_page100.json",
                imageFile: "images/page100.png",
                title: "Sections 95.1 + 95.2",
                description: "第100页词汇",
                primarySection: "95.1"
            },
            
            // 第101页 - Sections 96.1 + 96.2 + 96.3
            101: {
                pageNumber: 101,
                sections: ["96.1", "96.2", "96.3"],
                dataFile: "extracted_words/extracted_words_page101.json",
                imageFile: "images/page101.png",
                title: "Sections 96.1 + 96.2 + 96.3",
                description: "第101页词汇",
                primarySection: "96.1"
            },
            
            // 第102页 - Sections 97.1 + 97.2 + 97.3
            102: {
                pageNumber: 102,
                sections: ["97.1", "97.2", "97.3"],
                dataFile: "extracted_words/extracted_words_page102.json",
                imageFile: "images/page102.png",
                title: "Sections 97.1 + 97.2 + 97.3",
                description: "第102页词汇",
                primarySection: "97.1"
            },
            
            // 第103页 - Sections 98.1 + 98.2 + 98.3
            103: {
                pageNumber: 103,
                sections: ["98.1", "98.2", "98.3"],
                dataFile: "extracted_words/extracted_words_page103.json",
                imageFile: "images/page103.png",
                title: "Sections 98.1 + 98.2 + 98.3",
                description: "第103页词汇",
                primarySection: "98.1"
            },
            
            // 第104页 - Sections 99.1 + 99.2 + 99.3 + 99.4
            104: {
                pageNumber: 104,
                sections: ["99.1", "99.2", "99.3", "99.4"],
                dataFile: "extracted_words/extracted_words_page104.json",
                imageFile: "images/page104.png",
                title: "Sections 99.1 + 99.2 + 99.3 + 99.4",
                description: "第104页词汇",
                primarySection: "99.1"
            },
            
            // 第105页 - Sections 100.1 + 100.2
            105: {
                pageNumber: 105,
                sections: ["100.1", "100.2"],
                dataFile: "extracted_words/extracted_words_page105.json",
                imageFile: "images/page105.png",
                title: "Sections 100.1 + 100.2",
                description: "第105页词汇",
                primarySection: "100.1"
            },
            
            // 第106页 - Section 101.1
            106: {
                pageNumber: 106,
                sections: ["101.1"],
                dataFile: "extracted_words/extracted_words_page106.json",
                imageFile: "images/page106.png",
                title: "Section 101.1",
                description: "第106页词汇",
                primarySection: "101.1"
            },
            
            // 第107页 - Sections 102.1 + 102.2
            107: {
                pageNumber: 107,
                sections: ["102.1", "102.2"],
                dataFile: "extracted_words/extracted_words_page107.json",
                imageFile: "images/page107.png",
                title: "Sections 102.1 + 102.2",
                description: "第107页词汇",
                primarySection: "102.1"
            },
            
            // 第108页 - Sections 103.1 + 103.2 + 103.3
            108: {
                pageNumber: 108,
                sections: ["103.1", "103.2", "103.3"],
                dataFile: "extracted_words/extracted_words_page108.json",
                imageFile: "images/page108.png",
                title: "Sections 103.1 + 103.2 + 103.3",
                description: "第108页词汇",
                primarySection: "103.1"
            },
            
            // 第109页 - Section 104.1
            109: {
                pageNumber: 109,
                sections: ["104.1"],
                dataFile: "extracted_words/extracted_words_page109.json",
                imageFile: "images/page109.png",
                title: "Section 104.1",
                description: "第109页词汇",
                primarySection: "104.1"
            },
            
            // 第110页 - Sections 105.1 + 105.2
            110: {
                pageNumber: 110,
                sections: ["105.1", "105.2"],
                dataFile: "extracted_words/extracted_words_page110.json",
                imageFile: "images/page110.png",
                title: "Sections 105.1 + 105.2",
                description: "第110页词汇",
                primarySection: "105.1"
            },
            
            // 第111页 - Sections 106.1 + 106.2
            111: {
                pageNumber: 111,
                sections: ["106.1", "106.2"],
                dataFile: "extracted_words/extracted_words_page111.json",
                imageFile: "images/page111.png",
                title: "Sections 106.1 + 106.2",
                description: "第111页词汇",
                primarySection: "106.1"
            },
            
            // 第112页 - Section 107.1
            112: {
                pageNumber: 112,
                sections: ["107.1"],
                dataFile: "extracted_words/extracted_words_page112.json",
                imageFile: "images/page112.png",
                title: "Section 107.1",
                description: "第112页词汇",
                primarySection: "107.1"
            },
            
            // 第113页 - Section 108.1
            113: {
                pageNumber: 113,
                sections: ["108.1"],
                dataFile: "extracted_words/extracted_words_page113.json",
                imageFile: "images/page113.png",
                title: "Section 108.1",
                description: "第113页词汇",
                primarySection: "108.1"
            },
            
            // 第114页 - Sections 109.1 + 109.2
            114: {
                pageNumber: 114,
                sections: ["109.1", "109.2"],
                dataFile: "extracted_words/extracted_words_page114.json",
                imageFile: "images/page114.png",
                title: "Sections 109.1 + 109.2",
                description: "第114页词汇",
                primarySection: "109.1"
            },
            
            // 第115页 - Sections 110.1 + 110.2 + 110.3
            115: {
                pageNumber: 115,
                sections: ["110.1", "110.2", "110.3"],
                dataFile: "extracted_words/extracted_words_page115.json",
                imageFile: "images/page115.png",
                title: "Sections 110.1 + 110.2 + 110.3",
                description: "第115页词汇",
                primarySection: "110.1"
            },
            
            // 第116页 - Sections 111.1 + 111.2 + 111.3
            116: {
                pageNumber: 116,
                sections: ["111.1", "111.2", "111.3"],
                dataFile: "extracted_words/extracted_words_page116.json",
                imageFile: "images/page116.png",
                title: "Sections 111.1 + 111.2 + 111.3",
                description: "第116页词汇",
                primarySection: "111.1"
            },
            
            // 第117页 - Sections 112.1 + 112.2
            117: {
                pageNumber: 117,
                sections: ["112.1", "112.2"],
                dataFile: "extracted_words/extracted_words_page117.json",
                imageFile: "images/page117.png",
                title: "Sections 112.1 + 112.2",
                description: "第117页词汇",
                primarySection: "112.1"
            },
            
            // 第118页 - Section 113.1
            118: {
                pageNumber: 118,
                sections: ["113.1"],
                dataFile: "extracted_words/extracted_words_page118.json",
                imageFile: "images/page118.png",
                title: "Section 113.1",
                description: "第118页词汇",
                primarySection: "113.1"
            },
            
            // 第119页 - Sections 114.1 + 114.2
            119: {
                pageNumber: 119,
                sections: ["114.1", "114.2"],
                dataFile: "extracted_words/extracted_words_page119.json",
                imageFile: "images/page119.png",
                title: "Sections 114.1 + 114.2",
                description: "第119页词汇",
                primarySection: "114.1"
            },
            
            // 第120页 - Sections 115.1 + 115.2 + 115.3 + 115.4
            120: {
                pageNumber: 120,
                sections: ["115.1", "115.2", "115.3", "115.4"],
                dataFile: "extracted_words/extracted_words_page120.json",
                imageFile: "images/page120.png",
                title: "Sections 115.1 + 115.2 + 115.3 + 115.4",
                description: "第120页词汇",
                primarySection: "115.1"
            },
            
            // 第121页 - Sections 116.1 + 116.2 + 116.3 + 116.4 + 116.5
            121: {
                pageNumber: 121,
                sections: ["116.1", "116.2", "116.3", "116.4", "116.5"],
                dataFile: "extracted_words/extracted_words_page121.json",
                imageFile: "images/page121.png",
                title: "Sections 116.1 + 116.2 + 116.3 + 116.4 + 116.5",
                description: "第121页词汇",
                primarySection: "116.1"
            },
            
            // 第122页 - Sections 117.1 + 117.2 + 117.3 + 117.4
            122: {
                pageNumber: 122,
                sections: ["117.1", "117.2", "117.3", "117.4"],
                dataFile: "extracted_words/extracted_words_page122.json",
                imageFile: "images/page122.png",
                title: "Sections 117.1 + 117.2 + 117.3 + 117.4",
                description: "第122页词汇",
                primarySection: "117.1"
            },
            
            // 第123页 - Sections 118.1 + 118.2 + 118.3
            123: {
                pageNumber: 123,
                sections: ["118.1", "118.2", "118.3"],
                dataFile: "extracted_words/extracted_words_page123.json",
                imageFile: "images/page123.png",
                title: "Sections 118.1 + 118.2 + 118.3",
                description: "第123页词汇",
                primarySection: "118.1"
            },
            
            // 第124页 - Sections 119.1 + 119.2
            124: {
                pageNumber: 124,
                sections: ["119.1", "119.2"],
                dataFile: "extracted_words/extracted_words_page124.json",
                imageFile: "images/page124.png",
                title: "Sections 119.1 + 119.2",
                description: "第124页词汇",
                primarySection: "119.1"
            },
            
            // 第125页 - Sections 120.1 + 120.2
            125: {
                pageNumber: 125,
                sections: ["120.1", "120.2"],
                dataFile: "extracted_words/extracted_words_page125.json",
                imageFile: "images/page125.png",
                title: "Sections 120.1 + 120.2",
                description: "第125页词汇",
                primarySection: "120.1"
            },
            
            // 第126页 - Sections 121.1 + 121.2 + 121.3 + 121.4 + 121.5
            126: {
                pageNumber: 126,
                sections: ["121.1", "121.2", "121.3", "121.4", "121.5"],
                dataFile: "extracted_words/extracted_words_page126.json",
                imageFile: "images/page126.png",
                title: "Sections 121.1 + 121.2 + 121.3 + 121.4 + 121.5",
                description: "第126页词汇",
                primarySection: "121.1"
            },
            
            // 第127页 - Sections 122.1 + 122.2
            127: {
                pageNumber: 127,
                sections: ["122.1", "122.2"],
                dataFile: "extracted_words/extracted_words_page127.json",
                imageFile: "images/page127.png",
                title: "Sections 122.1 + 122.2",
                description: "第127页词汇",
                primarySection: "122.1"
            },
            
            // 第128页 - Sections 123.1 + 123.2 + 123.3
            128: {
                pageNumber: 128,
                sections: ["123.1", "123.2", "123.3"],
                dataFile: "extracted_words/extracted_words_page128.json",
                imageFile: "images/page128.png",
                title: "Sections 123.1 + 123.2 + 123.3",
                description: "第128页词汇",
                primarySection: "123.1"
            },
            
            // 第129页 - Section 124.1
            129: {
                pageNumber: 129,
                sections: ["124.1"],
                dataFile: "extracted_words/extracted_words_page129.json",
                imageFile: "images/page129.png",
                title: "Section 124.1",
                description: "第129页词汇",
                primarySection: "124.1"
            },
            
            // 第130页 - Sections 125.1 + 125.2 + 125.3
            130: {
                pageNumber: 130,
                sections: ["125.1", "125.2", "125.3"],
                dataFile: "extracted_words/extracted_words_page130.json",
                imageFile: "images/page130.png",
                title: "Sections 125.1 + 125.2 + 125.3",
                description: "第130页词汇",
                primarySection: "125.1"
            },
            
            // 第131页 - Sections 126.1 + 126.2 + 126.3
            131: {
                pageNumber: 131,
                sections: ["126.1", "126.2", "126.3"],
                dataFile: "extracted_words/extracted_words_page131.json",
                imageFile: "images/page131.png",
                title: "Sections 126.1 + 126.2 + 126.3",
                description: "第131页词汇",
                primarySection: "126.1"
            },
            
            // 第132页 - Sections 127.1 + 127.2
            132: {
                pageNumber: 132,
                sections: ["127.1", "127.2"],
                dataFile: "extracted_words/extracted_words_page132.json",
                imageFile: "images/page132.png",
                title: "Sections 127.1 + 127.2",
                description: "第132页词汇",
                primarySection: "127.1"
            },
            
            // 第133页 - Sections 128.1 + 128.2
            133: {
                pageNumber: 133,
                sections: ["128.1", "128.2"],
                dataFile: "extracted_words/extracted_words_page133.json",
                imageFile: "images/page133.png",
                title: "Sections 128.1 + 128.2",
                description: "第133页词汇",
                primarySection: "128.1"
            },
            
            // 第134页 - Sections 129.1 + 129.2
            134: {
                pageNumber: 134,
                sections: ["129.1", "129.2"],
                dataFile: "extracted_words/extracted_words_page134.json",
                imageFile: "images/page134.png",
                title: "Sections 129.1 + 129.2",
                description: "第134页词汇",
                primarySection: "129.1"
            },
            
            // 第135页 - Section 130.1
            135: {
                pageNumber: 135,
                sections: ["130.1"],
                dataFile: "extracted_words/extracted_words_page135.json",
                imageFile: "images/page135.png",
                title: "Section 130.1",
                description: "第135页词汇",
                primarySection: "130.1"
            },
            
            // 第136页 - Sections 131.1 + 131.2 + 131.3
            136: {
                pageNumber: 136,
                sections: ["131.1", "131.2", "131.3"],
                dataFile: "extracted_words/extracted_words_page136.json",
                imageFile: "images/page136.png",
                title: "Sections 131.1 + 131.2 + 131.3",
                description: "第136页词汇",
                primarySection: "131.1"
            },
            
            // 第137页 - Sections 132.1 + 132.2
            137: {
                pageNumber: 137,
                sections: ["132.1", "132.2"],
                dataFile: "extracted_words/extracted_words_page137.json",
                imageFile: "images/page137.png",
                title: "Sections 132.1 + 132.2",
                description: "第137页词汇",
                primarySection: "132.1"
            },
            
            // 第138页 - Section 133.1
            138: {
                pageNumber: 138,
                sections: ["133.1"],
                dataFile: "extracted_words/extracted_words_page138.json",
                imageFile: "images/page138.png",
                title: "Section 133.1",
                description: "第138页词汇",
                primarySection: "133.1"
            },
            
            // 第139页 - Section 134.1
            139: {
                pageNumber: 139,
                sections: ["134.1"],
                dataFile: "extracted_words/extracted_words_page139.json",
                imageFile: "images/page139.png",
                title: "Section 134.1",
                description: "第139页词汇",
                primarySection: "134.1"
            },
            
            // 第140页 - Sections 135.1 + 135.2
            140: {
                pageNumber: 140,
                sections: ["135.1", "135.2"],
                dataFile: "extracted_words/extracted_words_page140.json",
                imageFile: "images/page140.png",
                title: "Sections 135.1 + 135.2",
                description: "第140页词汇",
                primarySection: "135.1"
            },
            
            // 第141页 - Sections 136.1 + 136.2
            141: {
                pageNumber: 141,
                sections: ["136.1", "136.2"],
                dataFile: "extracted_words/extracted_words_page141.json",
                imageFile: "images/page141.png",
                title: "Sections 136.1 + 136.2",
                description: "第141页词汇",
                primarySection: "136.1"
            },
            
            // 第142页 - Sections 137.1 + 137.2 + 137.3
            142: {
                pageNumber: 142,
                sections: ["137.1", "137.2", "137.3"],
                dataFile: "extracted_words/extracted_words_page142.json",
                imageFile: "images/page142.png",
                title: "Sections 137.1 + 137.2 + 137.3",
                description: "第142页词汇",
                primarySection: "137.1"
            },
            
            // 第143页 - Sections 138.1 + 138.2
            143: {
                pageNumber: 143,
                sections: ["138.1", "138.2"],
                dataFile: "extracted_words/extracted_words_page143.json",
                imageFile: "images/page143.png",
                title: "Sections 138.1 + 138.2",
                description: "第143页词汇",
                primarySection: "138.1"
            },
            
            // 第144页 - Section 139.1
            144: {
                pageNumber: 144,
                sections: ["139.1"],
                dataFile: "extracted_words/extracted_words_page144.json",
                imageFile: "images/page144.png",
                title: "Section 139.1",
                description: "第144页词汇",
                primarySection: "139.1"
            },
            
            // 第145页 - Sections 140.1 + 140.2 + 140.3
            145: {
                pageNumber: 145,
                sections: ["140.1", "140.2", "140.3"],
                dataFile: "extracted_words/extracted_words_page145.json",
                imageFile: "images/page145.png",
                title: "Sections 140.1 + 140.2 + 140.3",
                description: "第145页词汇",
                primarySection: "140.1"
            },
            
            // 第146页 - Sections 141.1 + 141.2
            146: {
                pageNumber: 146,
                sections: ["141.1", "141.2"],
                dataFile: "extracted_words/extracted_words_page146.json",
                imageFile: "images/page146.png",
                title: "Sections 141.1 + 141.2",
                description: "第146页词汇",
                primarySection: "141.1"
            },
            
            // 第147页 - Section 142.1
            147: {
                pageNumber: 147,
                sections: ["142.1"],
                dataFile: "extracted_words/extracted_words_page147.json",
                imageFile: "images/page147.png",
                title: "Section 142.1",
                description: "第147页词汇",
                primarySection: "142.1"
            },
            
            // 第148页 - Sections 143.1 + 143.2
            148: {
                pageNumber: 148,
                sections: ["143.1", "143.2"],
                dataFile: "extracted_words/extracted_words_page148.json",
                imageFile: "images/page148.png",
                title: "Sections 143.1 + 143.2",
                description: "第148页词汇",
                primarySection: "143.1"
            },
            
            // 第149页 - Sections 144.1 + 144.2 + 144.3
            149: {
                pageNumber: 149,
                sections: ["144.1", "144.2", "144.3"],
                dataFile: "extracted_words/extracted_words_page149.json",
                imageFile: "images/page149.png",
                title: "Sections 144.1 + 144.2 + 144.3",
                description: "第149页词汇",
                primarySection: "144.1"
            },
            
            // 第150页 - Sections 145.1 + 145.2 + 145.3
            150: {
                pageNumber: 150,
                sections: ["145.1", "145.2", "145.3"],
                dataFile: "extracted_words/extracted_words_page150.json",
                imageFile: "images/page150.png",
                title: "Sections 145.1 + 145.2 + 145.3",
                description: "第150页词汇",
                primarySection: "145.1"
            },
            
            // 第151页 - Sections 146.1 + 146.2
            151: {
                pageNumber: 151,
                sections: ["146.1", "146.2"],
                dataFile: "extracted_words/extracted_words_page151.json",
                imageFile: "images/page151.png",
                title: "Sections 146.1 + 146.2",
                description: "第151页词汇",
                primarySection: "146.1"
            },
            
            // 第152页 - Sections 147.1 + 147.2
            152: {
                pageNumber: 152,
                sections: ["147.1", "147.2"],
                dataFile: "extracted_words/extracted_words_page152.json",
                imageFile: "images/page152.png",
                title: "Sections 147.1 + 147.2",
                description: "第152页词汇",
                primarySection: "147.1"
            },
            
            // 第153页 - Sections 148.1 + 148.2 + 148.3
            153: {
                pageNumber: 153,
                sections: ["148.1", "148.2", "148.3"],
                dataFile: "extracted_words/extracted_words_page153.json",
                imageFile: "images/page153.png",
                title: "Sections 148.1 + 148.2 + 148.3",
                description: "第153页词汇",
                primarySection: "148.1"
            },
            
            // 第154页 - Sections 149.1 + 149.2
            154: {
                pageNumber: 154,
                sections: ["149.1", "149.2"],
                dataFile: "extracted_words/extracted_words_page154.json",
                imageFile: "images/page154.png",
                title: "Sections 149.1 + 149.2",
                description: "第154页词汇",
                primarySection: "149.1"
            },
            
            // 第155页 - Sections 150.1 + 150.2 + 150.3
            155: {
                pageNumber: 155,
                sections: ["150.1", "150.2", "150.3"],
                dataFile: "extracted_words/extracted_words_page155.json",
                imageFile: "images/page155.png",
                title: "Sections 150.1 + 150.2 + 150.3",
                description: "第155页词汇",
                primarySection: "150.1"
            },
            
            // 第156页 - Sections 151.1 + 151.2
            156: {
                pageNumber: 156,
                sections: ["151.1", "151.2"],
                dataFile: "extracted_words/extracted_words_page156.json",
                imageFile: "images/page156.png",
                title: "Sections 151.1 + 151.2",
                description: "第156页词汇",
                primarySection: "151.1"
            },
            
            // 第157页 - Sections 152.1 + 152.2 + 152.3
            157: {
                pageNumber: 157,
                sections: ["152.1", "152.2", "152.3"],
                dataFile: "extracted_words/extracted_words_page157.json",
                imageFile: "images/page157.png",
                title: "Sections 152.1 + 152.2 + 152.3",
                description: "第157页词汇",
                primarySection: "152.1"
            },
            
            // 第158页 - Sections 153.1 + 153.2 + 153.3
            158: {
                pageNumber: 158,
                sections: ["153.1", "153.2", "153.3"],
                dataFile: "extracted_words/extracted_words_page158.json",
                imageFile: "images/page158.png",
                title: "Sections 153.1 + 153.2 + 153.3",
                description: "第158页词汇",
                primarySection: "153.1"
            },
            
            // 第159页 - Sections 154.1 + 154.2 + 154.3
            159: {
                pageNumber: 159,
                sections: ["154.1", "154.2", "154.3"],
                dataFile: "extracted_words/extracted_words_page159.json",
                imageFile: "images/page159.png",
                title: "Sections 154.1 + 154.2 + 154.3",
                description: "第159页词汇",
                primarySection: "154.1"
            },
            
            // 第160页 - Sections 155.1 + 155.2 + 155.3 + 155.4
            160: {
                pageNumber: 160,
                sections: ["155.1", "155.2", "155.3", "155.4"],
                dataFile: "extracted_words/extracted_words_page160.json",
                imageFile: "images/page160.png",
                title: "Sections 155.1 + 155.2 + 155.3 + 155.4",
                description: "第160页词汇",
                primarySection: "155.1"
            },
            
            // 第161页 - Sections 156.1 + 156.2 + 156.3 + 156.4
            161: {
                pageNumber: 161,
                sections: ["156.1", "156.2", "156.3", "156.4"],
                dataFile: "extracted_words/extracted_words_page161.json",
                imageFile: "images/page161.png",
                title: "Sections 156.1 + 156.2 + 156.3 + 156.4",
                description: "第161页词汇",
                primarySection: "156.1"
            },
            
            // 第162页 - Section 157.1
            162: {
                pageNumber: 162,
                sections: ["157.1"],
                dataFile: "extracted_words/extracted_words_page162.json",
                imageFile: "images/page162.png",
                title: "Section 157.1",
                description: "第162页词汇",
                primarySection: "157.1"
            },
            
            // 第163页 - Section 158.1
            163: {
                pageNumber: 163,
                sections: ["158.1"],
                dataFile: "extracted_words/extracted_words_page163.json",
                imageFile: "images/page163.png",
                title: "Section 158.1",
                description: "第163页词汇",
                primarySection: "158.1"
            },
            
            // 第164页 - Section 159.1
            164: {
                pageNumber: 164,
                sections: ["159.1"],
                dataFile: "extracted_words/extracted_words_page164.json",
                imageFile: "images/page164.png",
                title: "Section 159.1",
                description: "第164页词汇",
                primarySection: "159.1"
            },
            
            // 第165页 - Section 160.1
            165: {
                pageNumber: 165,
                sections: ["160.1"],
                dataFile: "extracted_words/extracted_words_page165.json",
                imageFile: "images/page165.png",
                title: "Section 160.1",
                description: "第165页词汇",
                primarySection: "160.1"
            },
            
            // 第166页 - Sections 161.1 + 161.2
            166: {
                pageNumber: 166,
                sections: ["161.1", "161.2"],
                dataFile: "extracted_words/extracted_words_page166.json",
                imageFile: "images/page166.png",
                title: "Sections 161.1 + 161.2",
                description: "第166页词汇",
                primarySection: "161.1"
            },
            
            // 第167页 - Sections 162.1 + 162.2
            167: {
                pageNumber: 167,
                sections: ["162.1", "162.2"],
                dataFile: "extracted_words/extracted_words_page167.json",
                imageFile: "images/page167.png",
                title: "Sections 162.1 + 162.2",
                description: "第167页词汇",
                primarySection: "162.1"
            },
            
            // 第168页 - Sections 163.1 + 163.2
            168: {
                pageNumber: 168,
                sections: ["163.1", "163.2"],
                dataFile: "extracted_words/extracted_words_page168.json",
                imageFile: "images/page168.png",
                title: "Sections 163.1 + 163.2",
                description: "第168页词汇",
                primarySection: "163.1"
            },
            
            // 第169页 - Sections 164.1 + 164.2 + 164.3 + 164.4
            169: {
                pageNumber: 169,
                sections: ["164.1", "164.2", "164.3", "164.4"],
                dataFile: "extracted_words/extracted_words_page169.json",
                imageFile: "images/page169.png",
                title: "Sections 164.1 + 164.2 + 164.3 + 164.4",
                description: "第169页词汇",
                primarySection: "164.1"
            },
            
            // 第170页 - Section 165.1
            170: {
                pageNumber: 170,
                sections: ["165.1"],
                dataFile: "extracted_words/extracted_words_page170.json",
                imageFile: "images/page170.png",
                title: "Section 165.1",
                description: "第170页词汇",
                primarySection: "165.1"
            },
            
            // 第171页 - Sections 166.1 + 166.2
            171: {
                pageNumber: 171,
                sections: ["166.1", "166.2"],
                dataFile: "extracted_words/extracted_words_page171.json",
                imageFile: "images/page171.png",
                title: "Sections 166.1 + 166.2",
                description: "第171页词汇",
                primarySection: "166.1"
            },
            
            // 第172页 - Section 167.1
            172: {
                pageNumber: 172,
                sections: ["167.1"],
                dataFile: "extracted_words/extracted_words_page172.json",
                imageFile: "images/page172.png",
                title: "Section 167.1",
                description: "第172页词汇",
                primarySection: "167.1"
            },
            
            // 第173页 - Section 168.1
            173: {
                pageNumber: 173,
                sections: ["168.1"],
                dataFile: "extracted_words/extracted_words_page173.json",
                imageFile: "images/page173.png",
                title: "Section 168.1",
                description: "第173页词汇",
                primarySection: "168.1"
            },
            
            // 第174页 - Section 169.1
            174: {
                pageNumber: 174,
                sections: ["169.1"],
                dataFile: "extracted_words/extracted_words_page174.json",
                imageFile: "images/page174.png",
                title: "Section 169.1",
                description: "第174页词汇",
                primarySection: "169.1"
            },
            
            // 第175页 - Section 170.1
            175: {
                pageNumber: 175,
                sections: ["170.1"],
                dataFile: "extracted_words/extracted_words_page175.json",
                imageFile: "images/page175.png",
                title: "Section 170.1",
                description: "第175页词汇",
                primarySection: "170.1"
            },
            
            // 第176页 - Sections 171.1 + 171.2
            176: {
                pageNumber: 176,
                sections: ["171.1", "171.2"],
                dataFile: "extracted_words/extracted_words_page176.json",
                imageFile: "images/page176.png",
                title: "Sections 171.1 + 171.2",
                description: "第176页词汇",
                primarySection: "171.1"
            },
            
            // 第177页 - Section 172.1
            177: {
                pageNumber: 177,
                sections: ["172.1"],
                dataFile: "extracted_words/extracted_words_page177.json",
                imageFile: "images/page177.png",
                title: "Section 172.1",
                description: "第177页词汇",
                primarySection: "172.1"
            },
            
            // 第178页 - Sections 173.1 + 173.2 + 173.3 + 173.4
            178: {
                pageNumber: 178,
                sections: ["173.1", "173.2", "173.3", "173.4"],
                dataFile: "extracted_words/extracted_words_page178.json",
                imageFile: "images/page178.png",
                title: "Sections 173.1 + 173.2 + 173.3 + 173.4",
                description: "第178页词汇",
                primarySection: "173.1"
            },
            
            // 第179页 - Sections 174.1 + 174.2 + 174.3
            179: {
                pageNumber: 179,
                sections: ["174.1", "174.2", "174.3"],
                dataFile: "extracted_words/extracted_words_page179.json",
                imageFile: "images/page179.png",
                title: "Sections 174.1 + 174.2 + 174.3",
                description: "第179页词汇",
                primarySection: "174.1"
            },
            
            // 第180页 - Section 175.1
            180: {
                pageNumber: 180,
                sections: ["175.1"],
                dataFile: "extracted_words/extracted_words_page180.json",
                imageFile: "images/page180.png",
                title: "Section 175.1",
                description: "第180页词汇",
                primarySection: "175.1"
            },
            
            // 第181页 - Sections 176.1 + 176.2
            181: {
                pageNumber: 181,
                sections: ["176.1", "176.2"],
                dataFile: "extracted_words/extracted_words_page181.json",
                imageFile: "images/page181.png",
                title: "Sections 176.1 + 176.2",
                description: "第181页词汇",
                primarySection: "176.1"
            },
            
            // 第182页 - Section 177.1
            182: {
                pageNumber: 182,
                sections: ["177.1"],
                dataFile: "extracted_words/extracted_words_page182.json",
                imageFile: "images/page182.png",
                title: "Section 177.1",
                description: "第182页词汇",
                primarySection: "177.1"
            },
            
            // 第183页 - Section 178.1
            183: {
                pageNumber: 183,
                sections: ["178.1"],
                dataFile: "extracted_words/extracted_words_page183.json",
                imageFile: "images/page183.png",
                title: "Section 178.1",
                description: "第183页词汇",
                primarySection: "178.1"
            },
            
            // 第184页 - Sections 179.1 + 179.2 + 179.3
            184: {
                pageNumber: 184,
                sections: ["179.1", "179.2", "179.3"],
                dataFile: "extracted_words/extracted_words_page184.json",
                imageFile: "images/page184.png",
                title: "Sections 179.1 + 179.2 + 179.3",
                description: "第184页词汇",
                primarySection: "179.1"
            },
            
            // 第185页 - Sections 180.1 + 180.2
            185: {
                pageNumber: 185,
                sections: ["180.1", "180.2"],
                dataFile: "extracted_words/extracted_words_page185.json",
                imageFile: "images/page185.png",
                title: "Sections 180.1 + 180.2",
                description: "第185页词汇",
                primarySection: "180.1"
            },
            
        };
        
        // 保持向后兼容的章节映射
        this.sectionToPageMap = {
            "1.1": 7,
            "1.2": 7,
            "1.3": 7,
            "2.1": 8,
            "2.2": 8,
            "2.3": 8,
            "3.1": 9,
            "3.2": 9,
            "3.3": 9,
            "4.1": 10,
            "4.2": 10,
            "4.3": 10,
            "4.4": 10,
            "5.1": 11,
            "5.2": 11,
            "5.3": 11,
            "5.4": 11,
            "6.1": 12,
            "7.1": 13,
            "7.2": 13,
            "7.3": 13,
            "8.1": 14,
            "8.2": 14,
            "8.3": 14,
            "9.1": 15,
            "9.2": 15,
            "9.3": 15,
            "10.1": 16,
            "11.1": 17,
            "12.1": 18,
            "12.2": 18,
            "13.1": 19,
            "13.2": 19,
            "13.3": 19,
            "14.1": 20,
            "14.2": 20,
            "14.3": 20,
            "14.4": 20,
            "15.1": 21,
            "15.2": 21,
            "15.3": 21,
            "15.4": 21,
            "16.1": 22,
            "16.2": 22,
            "16.3": 22,
            "16.4": 22,
            "17.1": 23,
            "17.2": 23,
            "17.3": 23,
            "18.1": 24,
            "18.2": 24,
            "18.3": 24,
            "18.4": 24,
            "19.1": 25,
            "19.2": 25,
            "20.1": 26,
            "20.2": 26,
            "20.3": 26,
            "21.1": 27,
            "21.2": 27,
            "22.1": 28,
            "22.2": 28,
            "23.1": 29,
            "23.2": 29,
            "24.1": 30,
            "24.2": 30,
            "25.1": 31,
            "25.2": 31,
            "26.1": 32,
            "26.2": 32,
            "27.1": 33,
            "27.2": 33,
            "28.1": 34,
            "29.1": 35,
            "29.2": 35,
            "30.1": 36,
            "30.2": 36,
            "31.1": 37,
            "32.1": 38,
            "32.2": 38,
            "33.1": 39,
            "33.2": 39,
            "33.3": 39,
            "34.1": 40,
            "34.2": 40,
            "35.1": 41,
            "35.2": 41,
            "35.3": 41,
            "36.1": 42,
            "36.2": 42,
            "36.3": 42,
            "37.1": 43,
            "37.2": 43,
            "38.1": 44,
            "38.2": 44,
            "38.3": 44,
            "39.1": 45,
            "39.2": 45,
            "40.1": 46,
            "40.2": 46,
            "41.1": 47,
            "41.2": 47,
            "42.1": 48,
            "43.1": 49,
            "43.2": 49,
            "44.1": 50,
            "44.2": 50,
            "45.1": 51,
            "45.2": 51,
            "45.3": 51,
            "46.1": 52,
            "46.2": 52,
            "46.3": 52,
            "47.1": 53,
            "47.2": 53,
            "48.1": 54,
            "48.2": 54,
            "48.3": 54,
            "48.4": 54,
            "49.1": 55,
            "50.1": 56,
            "50.2": 56,
            "50.3": 56,
            "51.1": 57,
            "51.2": 57,
            "52.1": 58,
            "52.2": 58,
            "52.3": 58,
            "52.4": 58,
            "53.1": 59,
            "53.2": 59,
            "53.3": 59,
            "53.4": 59,
            "54.1": 60,
            "54.2": 60,
            "54.3": 60,
            "55.1": 61,
            "55.2": 61,
            "56.1": 62,
            "57.1": 63,
            "57.2": 63,
            "57.3": 63,
            "58.1": 64,
            "58.2": 64,
            "58.3": 64,
            "59.1": 65,
            "59.2": 65,
            "60.1": 66,
            "60.2": 66,
            "60.3": 66,
            "60.4": 66,
            "61.1": 67,
            "61.2": 67,
            "61.3": 67,
            "61.4": 67,
            "62.1": 68,
            "63.1": 69,
            "63.2": 69,
            "63.3": 69,
            "64.1": 70,
            "64.2": 70,
            "65.1": 71,
            "65.2": 71,
            "65.3": 71,
            "66.1": 72,
            "67.1": 72,
            "68.1": 73,
            "68.2": 73,
            "68.3": 73,
            "68.4": 73,
            "69.1": 74,
            "70.1": 75,
            "71.1": 76,
            "71.2": 76,
            "72.1": 77,
            "72.2": 77,
            "73.1": 78,
            "73.2": 78,
            "73.3": 78,
            "74.1": 79,
            "74.2": 79,
            "74.3": 79,
            "74.4": 79,
            "74.5": 79,
            "74.6": 79,
            "75.1": 80,
            "75.2": 80,
            "76.1": 81,
            "77.1": 82,
            "77.2": 82,
            "78.1": 83,
            "79.1": 84,
            "79.2": 84,
            "79.3": 84,
            "80.1": 85,
            "80.2": 85,
            "80.3": 85,
            "81.1": 86,
            "81.2": 86,
            "82.1": 87,
            "82.2": 87,
            "82.3": 87,
            "83.1": 88,
            "83.2": 88,
            "84.1": 89,
            "84.2": 89,
            "84.3": 89,
            "85.1": 90,
            "85.2": 90,
            "86.1": 91,
            "86.2": 91,
            "86.3": 91,
            "86.4": 91,
            "87.1": 92,
            "87.2": 92,
            "87.3": 92,
            "88.1": 93,
            "88.2": 93,
            "88.3": 93,
            "88.4": 93,
            "88.5": 93,
            "89.1": 94,
            "90.1": 95,
            "91.1": 96,
            "91.2": 96,
            "92.1": 97,
            "92.2": 97,
            "92.3": 97,
            "93.1": 98,
            "93.2": 98,
            "94.1": 99,
            "94.2": 99,
            "95.1": 100,
            "95.2": 100,
            "96.1": 101,
            "96.2": 101,
            "96.3": 101,
            "97.1": 102,
            "97.2": 102,
            "97.3": 102,
            "98.1": 103,
            "98.2": 103,
            "98.3": 103,
            "99.1": 104,
            "99.2": 104,
            "99.3": 104,
            "99.4": 104,
            "100.1": 105,
            "100.2": 105,
            "101.1": 106,
            "102.1": 107,
            "102.2": 107,
            "103.1": 108,
            "103.2": 108,
            "103.3": 108,
            "104.1": 109,
            "105.1": 110,
            "105.2": 110,
            "106.1": 111,
            "106.2": 111,
            "107.1": 112,
            "108.1": 113,
            "109.1": 114,
            "109.2": 114,
            "110.1": 115,
            "110.2": 115,
            "110.3": 115,
            "111.1": 116,
            "111.2": 116,
            "111.3": 116,
            "112.1": 117,
            "112.2": 117,
            "113.1": 118,
            "114.1": 119,
            "114.2": 119,
            "115.1": 120,
            "115.2": 120,
            "115.3": 120,
            "115.4": 120,
            "116.1": 121,
            "116.2": 121,
            "116.3": 121,
            "116.4": 121,
            "116.5": 121,
            "117.1": 122,
            "117.2": 122,
            "117.3": 122,
            "117.4": 122,
            "118.1": 123,
            "118.2": 123,
            "118.3": 123,
            "119.1": 124,
            "119.2": 124,
            "120.1": 125,
            "120.2": 125,
            "121.1": 126,
            "121.2": 126,
            "121.3": 126,
            "121.4": 126,
            "121.5": 126,
            "122.1": 127,
            "122.2": 127,
            "123.1": 128,
            "123.2": 128,
            "123.3": 128,
            "124.1": 129,
            "125.1": 130,
            "125.2": 130,
            "125.3": 130,
            "126.1": 131,
            "126.2": 131,
            "126.3": 131,
            "127.1": 132,
            "127.2": 132,
            "128.1": 133,
            "128.2": 133,
            "129.1": 134,
            "129.2": 134,
            "130.1": 135,
            "131.1": 136,
            "131.2": 136,
            "131.3": 136,
            "132.1": 137,
            "132.2": 137,
            "133.1": 138,
            "134.1": 139,
            "135.1": 140,
            "135.2": 140,
            "136.1": 141,
            "136.2": 141,
            "137.1": 142,
            "137.2": 142,
            "137.3": 142,
            "138.1": 143,
            "138.2": 143,
            "139.1": 144,
            "140.1": 145,
            "140.2": 145,
            "140.3": 145,
            "141.1": 146,
            "141.2": 146,
            "142.1": 147,
            "143.1": 148,
            "143.2": 148,
            "144.1": 149,
            "144.2": 149,
            "144.3": 149,
            "145.1": 150,
            "145.2": 150,
            "145.3": 150,
            "146.1": 151,
            "146.2": 151,
            "147.1": 152,
            "147.2": 152,
            "148.1": 153,
            "148.2": 153,
            "148.3": 153,
            "149.1": 154,
            "149.2": 154,
            "150.1": 155,
            "150.2": 155,
            "150.3": 155,
            "151.1": 156,
            "151.2": 156,
            "152.1": 157,
            "152.2": 157,
            "152.3": 157,
            "153.1": 158,
            "153.2": 158,
            "153.3": 158,
            "154.1": 159,
            "154.2": 159,
            "154.3": 159,
            "155.1": 160,
            "155.2": 160,
            "155.3": 160,
            "155.4": 160,
            "156.1": 161,
            "156.2": 161,
            "156.3": 161,
            "156.4": 161,
            "157.1": 162,
            "158.1": 163,
            "159.1": 164,
            "160.1": 165,
            "161.1": 166,
            "161.2": 166,
            "162.1": 167,
            "162.2": 167,
            "163.1": 168,
            "163.2": 168,
            "164.1": 169,
            "164.2": 169,
            "164.3": 169,
            "164.4": 169,
            "165.1": 170,
            "166.1": 171,
            "166.2": 171,
            "167.1": 172,
            "168.1": 173,
            "169.1": 174,
            "170.1": 175,
            "171.1": 176,
            "171.2": 176,
            "172.1": 177,
            "173.1": 178,
            "173.2": 178,
            "173.3": 178,
            "173.4": 178,
            "174.1": 179,
            "174.2": 179,
            "174.3": 179,
            "175.1": 180,
            "176.1": 181,
            "176.2": 181,
            "177.1": 182,
            "178.1": 183,
            "179.1": 184,
            "179.2": 184,
            "179.3": 184,
            "180.1": 185,
            "180.2": 185,
        };

        // 默认页面
        this.defaultPage = 7;
    }
    
    /**
     * 获取页面配置
     * @param {number|string} page - 页码或章节标识
     * @returns {Object} 页面配置对象
     */
    getPageConfig(page = null) {
        let targetPage = page || this.defaultPage;
        
        // 如果传入的是章节标识，转换为页码
        if (typeof targetPage === 'string' && this.sectionToPageMap[targetPage]) {
            const sectionPages = this.sectionToPageMap[targetPage];
            // 如果章节在多个页面中出现，默认使用第一个页面
            targetPage = Array.isArray(sectionPages) ? sectionPages[0] : sectionPages;
        }
        
        // 确保是数字类型
        targetPage = parseInt(targetPage);
        
        if (this.pageConfigs[targetPage]) {
            return { ...this.pageConfigs[targetPage] };
        } else {
            console.warn(`未找到页面 ${targetPage} 的配置，使用默认配置`);
            return { ...this.pageConfigs[this.defaultPage] };
        }
    }
    
    /**
     * 获取所有可用的页面配置
     * @returns {Array} 页面配置列表
     */
    getAllPageConfigs() {
        return Object.keys(this.pageConfigs).map(page => ({
            page: parseInt(page),
            ...this.pageConfigs[page]
        }));
    }
    
    /**
     * 添加新的页面配置
     * @param {number} pageNumber - 页码
     * @param {Object} config - 页面配置
     */
    addPageConfig(pageNumber, config) {
        this.pageConfigs[pageNumber] = {
            pageNumber: pageNumber,
            sections: config.sections || [],
            dataFile: config.dataFile || `extracted_words/extracted_words_page${pageNumber}.json`,
            imageFile: config.imageFile || `images/page${pageNumber}.png`,
            title: config.title || `Page ${pageNumber}`,
            description: config.description || `第${pageNumber}页词汇`,
            primarySection: config.primarySection || config.sections[0]
        };

        console.log(`添加页面配置: ${pageNumber}`, this.pageConfigs[pageNumber]);
    }
    
    /**
     * 检查页面是否存在
     * @param {number} pageNumber - 页码
     * @returns {boolean} 是否存在
     */
    hasPage(pageNumber) {
        return this.pageConfigs.hasOwnProperty(pageNumber);
    }
    
    /**
     * 根据页面获取章节列表
     * @param {number} pageNumber - 页码
     * @returns {Array} 章节列表
     */
    getSectionsByPage(pageNumber) {
        const config = this.getPageConfig(pageNumber);
        return config ? config.sections : [];
    }
    
    /**
     * 智能获取页面配置（优先页面号，其次章节号）
     * @param {number|string} identifier - 页面号或章节号
     * @returns {Object} 页面配置对象
     */
    getSmartPageConfig(identifier) {
        // 如果是数字，直接作为页面号处理
        if (typeof identifier === 'number' || /^\d+$/.test(identifier)) {
            return this.getPageConfig(parseInt(identifier));
        }
        
        // 如果是章节格式，转换为页面号
        if (this.sectionToPageMap[identifier]) {
            const sectionPages = this.sectionToPageMap[identifier];
            const targetPage = Array.isArray(sectionPages) ? sectionPages[0] : sectionPages;
            return this.getPageConfig(targetPage);
        }
        
        // 默认返回第一页
        return this.getPageConfig(this.defaultPage);
    }
    
    /**
     * 从URL获取页面配置
     * @returns {Object} 页面配置对象
     */
    getPageConfigFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // 优先使用page参数
        const pageParam = urlParams.get('page');
        if (pageParam) {
            return this.getPageConfig(parseInt(pageParam));
        }
        
        // 其次使用section参数（向后兼容）
        const sectionParam = urlParams.get('section');
        if (sectionParam && this.sectionToPageMap[sectionParam]) {
            const sectionPages = this.sectionToPageMap[sectionParam];
            const targetPage = Array.isArray(sectionPages) ? sectionPages[0] : sectionPages;
            return this.getPageConfig(targetPage);
        }
        
        // 默认页面
        return this.getPageConfig(this.defaultPage);
    }
    
    /**
     * 获取文件路径
     * @param {number} pageNumber - 页面号
     * @param {string} type - 文件类型 ('data', 'image')
     * @returns {string} 文件路径
     */
    getFilePath(pageNumber, type = 'data') {
        const config = this.getPageConfig(pageNumber);
        if (!config) return null;
        
        switch (type) {
            case 'data':
                return config.dataFile;
            case 'image':
                return config.imageFile;
            default:
                return null;
        }
    }
    
    /**
     * 获取音频文件路径
     * @param {string} section - 章节号
     * @param {string} filename - 文件名
     * @returns {string} 音频文件路径
     */
    getAudioFilePath(section, filename) {
        return `all_sounds/${section}/${filename}`;
    }
}

// 创建全局实例
window.pageConfigManager = new PageConfigManager();

// 导出配置管理器（用于模块化环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageConfigManager;
}
