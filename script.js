// 角色与推荐图层对应关系
const roleLayers = {
    '学生': ['手机充电点', '公厕', '医疗点', '休息点'],
    '游客': ['打卡点', '公厕', '停车点', '母婴室', '拍照引导'],
    '宝妈/亲子': ['母婴室', '公厕', '医疗设施', '停车点'],
    '老年人': ['养老设施', '医疗设施', '公厕', '休息点'],
    '车主/骑手': ['汽车/电瓶车充电桩', '停车点', '公厕'],
    '应急求助者': ['临时住宿', '公益餐食', '救助站', '急救点', '警务站']
};

// 设施数据（从GeoJSON文件加载）
let facilitiesData = [];

// 应急求助数据
const emergencyData = [
    {
        id: 1,
        name: '盘龙区急救中心',
        type: '急救点',
        address: '昆明市盘龙区急救路',
        phone: '120',
        details: '24小时急救服务'
    },
    {
        id: 2,
        name: '盘龙区公安局',
        type: '警务站',
        address: '昆明市盘龙区公安路',
        phone: '110',
        details: '24小时警务服务'
    },
    {
        id: 3,
        name: '盘龙区救助站',
        type: '救助站',
        address: '昆明市盘龙区救助路',
        phone: '0871-65123456',
        details: '提供临时住宿和食物'
    },
    {
        id: 4,
        name: '盘龙区公益食堂',
        type: '公益餐食',
        address: '昆明市盘龙区公益路',
        phone: '0871-65654321',
        details: '免费提供餐食'
    }
];

// 初始化地图（使用高德地图API）
function initMap() {
    // 初始化高德地图
    const map = new AMap.Map('map', {
        center: [102.71, 25.047], // 昆明市盘龙区中心坐标
        zoom: 13, // 缩放级别
        resizeEnable: true // 允许地图自适应容器大小
    });
    
    // 添加地图控件
    map.addControl(new AMap.Scale()); // 比例尺
    map.addControl(new AMap.ToolBar()); // 工具栏
    map.addControl(new AMap.MapType()); // 地图类型切换
    
    // 存储地图实例
    window.map = map;
    
    // 从GeoJSON文件加载设施数据
    fetch('facilities.geojson')
        .then(response => response.json())
        .then(data => {
            facilitiesData = data.features;
            loadFacilities(map, data);
        })
        .catch(error => {
            console.error('加载GeoJSON数据失败:', error);
            // 加载失败时使用默认数据
            loadDefaultFacilities(map);
        });
    
    return map;
}

// 加载设施点位（从GeoJSON）
function loadFacilities(map, geojsonData) {
    // 创建不同类型设施的图层
    const facilityLayers = {};
    
    // 为每种设施类型创建图层
    const facilityTypes = ['手机充电点', '公厕', '医疗点', '休息点', '打卡点', '停车点', '母婴室', '养老设施', '汽车/电瓶车充电桩', '救助站'];
    facilityTypes.forEach(type => {
        facilityLayers[type] = new AMap.LayerGroup();
        facilityLayers[type].addTo(map);
    });
    
    // 加载GeoJSON数据到地图
    geojsonData.features.forEach(feature => {
        const props = feature.properties;
        const coordinates = feature.geometry.coordinates;
        
        // 创建标记
        const marker = new AMap.Marker({
            position: coordinates,
            title: props.name,
            icon: new AMap.Icon({
                size: new AMap.Size(30, 30),
                image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
                imageSize: new AMap.Size(30, 30)
            })
        });
        
        // 创建信息窗口
        const infoWindow = new AMap.InfoWindow({
            content: `
                <h3>${props.name}</h3>
                <p><strong>类型：</strong>${props.type}</p>
                <p><strong>地址：</strong>${props.address}</p>
                <p><strong>详情：</strong>${props.details}</p>
            `,
            offset: new AMap.Pixel(0, -30)
        });
        
        // 绑定点击事件
        marker.on('click', function() {
            infoWindow.open(map, coordinates);
        });
        
        // 将标记添加到对应类型的图层
        if (facilityLayers[props.type]) {
            marker.addTo(facilityLayers[props.type]);
        }
    });
    
    // 存储图层信息，用于图层控制
    window.facilityLayers = facilityLayers;
}

// 加载默认设施数据（当GeoJSON加载失败时）
function loadDefaultFacilities(map) {
    const defaultData = [
        { name: '盘龙区图书馆', type: '休息点', location: [102.712, 25.048], address: '昆明市盘龙区北京路', details: '提供免费休息区和充电设施' },
        { name: '盘龙区人民医院', type: '医疗点', location: [102.715, 25.050], address: '昆明市盘龙区人民东路', details: '24小时急诊服务' },
        { name: '盘龙区中心广场', type: '打卡点', location: [102.710, 25.045], address: '昆明市盘龙区中心路', details: '城市地标，适合拍照' },
        { name: '盘龙区停车场', type: '停车点', location: [102.718, 25.052], address: '昆明市盘龙区停车场路', details: '收费停车场，有充电桩' },
        { name: '盘龙区母婴室', type: '母婴室', location: [102.713, 25.047], address: '昆明市盘龙区妇幼保健院', details: '设施齐全，免费使用' }
    ];
    
    defaultData.forEach(facility => {
        // 创建标记
        const marker = new AMap.Marker({
            position: facility.location,
            title: facility.name,
            icon: new AMap.Icon({
                size: new AMap.Size(30, 30),
                image: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
                imageSize: new AMap.Size(30, 30)
            })
        });
        
        // 创建信息窗口
        const infoWindow = new AMap.InfoWindow({
            content: `
                <h3>${facility.name}</h3>
                <p><strong>类型：</strong>${facility.type}</p>
                <p><strong>地址：</strong>${facility.address}</p>
                <p><strong>详情：</strong>${facility.details}</p>
            `,
            offset: new AMap.Pixel(0, -30)
        });
        
        // 绑定点击事件
        marker.on('click', function() {
            infoWindow.open(map, facility.location);
        });
        
        marker.addTo(map);
    });
}

// 角色选择处理
function handleRoleSelection() {
    const roleCards = document.querySelectorAll('.role-card');
    
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            const role = this.querySelector('h3').textContent;
            const recommendedLayers = roleLayers[role];
            
            // 显示推荐服务
            showRecommendedServices(role, recommendedLayers);
            
            // 存储角色选择
            localStorage.setItem('selectedRole', role);
        });
    });
}

// 显示推荐服务
function showRecommendedServices(role, layers) {
    const serviceSection = document.querySelector('.recommend-section');
    const serviceCardsContainer = serviceSection.querySelector('.service-cards');
    
    // 清空现有卡片
    serviceCardsContainer.innerHTML = '';
    
    // 添加推荐服务卡片
    layers.forEach(layer => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
            <h3>${layer}</h3>
            <p>为${role}推荐的服务</p>
        `;
        serviceCardsContainer.appendChild(card);
    });
    
    // 滚动到服务卡片区
    serviceSection.scrollIntoView({ behavior: 'smooth' });
}

// 进入地图页处理
function handleEnterMap() {
    const mapBtn = document.querySelector('.map-btn');
    if (mapBtn) {
        mapBtn.addEventListener('click', function() {
            window.location.href = 'map.html';
        });
    }
}

// 初始化图层控制
function initLayerControl() {
    const layerCheckboxes = document.querySelectorAll('.layer-item input');
    
    layerCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const layerName = this.value;
            const isChecked = this.checked;
            
            // 控制图层显示/隐藏（高德地图API）
            if (window.facilityLayers && window.facilityLayers[layerName]) {
                if (isChecked) {
                    window.facilityLayers[layerName].addTo(window.map);
                } else {
                    window.facilityLayers[layerName].remove();
                }
            }
            
            console.log(`${layerName} ${isChecked ? '显示' : '隐藏'}`);
        });
    });
}

// 初始化搜索功能
function initSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            // 这里可以实现搜索逻辑
            console.log('搜索：', searchTerm);
        });
    }
}

// 初始化上报表单
function initReportForm() {
    const reportForm = document.querySelector('.report-form');
    if (reportForm) {
        reportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const facilityType = document.querySelector('#facility-type').value;
            const issueType = document.querySelector('#issue-type').value;
            const description = document.querySelector('#description').value;
            
            // 模拟提交
            alert('上报成功！我们会尽快处理您的反馈。');
            reportForm.reset();
        });
    }
}

// 加载应急求助数据
function loadEmergencyData() {
    const emergencyCardsContainer = document.querySelector('.emergency-cards');
    if (emergencyCardsContainer) {
        emergencyData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'emergency-card';
            card.innerHTML = `
                <h3>${item.name}</h3>
                <p><strong>类型：</strong>${item.type}</p>
                <p><strong>地址：</strong>${item.address}</p>
                <p><strong>电话：</strong><span class="phone">${item.phone}</span></p>
                <p><strong>详情：</strong>${item.details}</p>
            `;
            emergencyCardsContainer.appendChild(card);
        });
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    // 首页初始化
    if (document.querySelector('.role-section')) {
        handleRoleSelection();
        handleEnterMap();
    }
    
    // 地图页初始化
    if (document.querySelector('#map')) {
        const map = initMap();
        initLayerControl();
        initSearch();
    }
    
    // 上报页初始化
    if (document.querySelector('.report-form')) {
        initReportForm();
    }
    
    // 应急页初始化
    if (document.querySelector('.emergency-cards')) {
        loadEmergencyData();
    }
});
