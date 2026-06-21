import fs from "node:fs";
import path from "node:path";

const sourcePath =
  "/Users/vuvanhoang/.codex/attachments/45e678b0-7580-4e98-b025-c6691dcba428/pasted-text.txt";
const outputDir = "/Users/vuvanhoang/Workspace/NextJS/unischedule_admin/docs/openapi";
const outputPath = path.join(outputDir, "unischedule-service.enhanced.json");

const raw = fs.readFileSync(sourcePath, "utf8");
const spec = JSON.parse(raw);

const addParamDescriptions = (parameters = [], descriptions = {}) =>
  parameters.map((parameter) => ({
    ...parameter,
    description: descriptions[parameter.name] ?? parameter.description,
  }));

spec.info.description =
  "API cho quản trị UniSchedule, bao gồm truy vấn account, nhật ký truy cập, dashboard tổng hợp và các báo cáo phân tích/tăng trưởng theo kỳ.";

spec.tags = [
  {
    name: "User Access Log",
    description:
      "Các API tra cứu lịch sử truy cập, phục vụ kiểm tra hoạt động đăng nhập và phân tích hành vi sử dụng theo thiết bị/thời gian.",
  },
  {
    name: "Account",
    description:
      "Các API tra cứu account phục vụ màn hình quản trị, bao gồm tìm kiếm, phân trang và lấy chi tiết account.",
  },
  {
    name: "Report",
    description:
      "Nhóm API báo cáo tổng hợp, thống kê chi tiết và tăng trưởng theo kỳ cho account, batch account và access log.",
  },
];

spec.paths["/report/accounts/growth-over-time"] = {
  get: {
    tags: ["Report"],
    summary: "Lấy báo cáo tăng trưởng account theo thời gian",
    description:
      "Trả về chuỗi thời gian tăng trưởng account trong một khoảng thời gian chỉ định. Dữ liệu gồm các mốc thời gian liên tiếp để frontend dựng line chart, area chart hoặc bảng so sánh xu hướng.",
    operationId: "getAccountGrowthOverTime",
    parameters: [
      {
        name: "startDate",
        in: "query",
        required: false,
        description:
          "Mốc bắt đầu của báo cáo, định dạng ISO 8601. Nếu bỏ trống, backend có thể tự suy ra theo `days`.",
        schema: {
          type: "string",
          format: "date-time",
        },
      },
      {
        name: "endDate",
        in: "query",
        required: false,
        description:
          "Mốc kết thúc của báo cáo, định dạng ISO 8601. Nếu bỏ trống, backend có thể dùng thời điểm hiện tại.",
        schema: {
          type: "string",
          format: "date-time",
        },
      },
      {
        name: "days",
        in: "query",
        required: false,
        description:
          "Số ngày gần nhất cần thống kê khi không truyền `startDate` và `endDate`, mặc định `30`.",
        schema: {
          type: "integer",
          format: "int32",
          default: 30,
        },
      },
      {
        name: "groupBy",
        in: "query",
        required: false,
        description:
          "Đơn vị gom nhóm chuỗi thời gian để vẽ biểu đồ tăng trưởng.",
        schema: {
          type: "string",
          enum: ["day", "week", "month"],
          default: "day",
        },
      },
    ],
    responses: {
      "200": {
        description:
          "Báo cáo tăng trưởng account theo thời gian, gồm time series và tổng hợp tăng trưởng toàn kỳ.",
        content: {
          "*/*": {
            schema: {
              $ref: "#/components/schemas/ResponseDataTimeGrowthReportDTO",
            },
          },
        },
      },
    },
  },
};

spec.paths["/report/access-logs/growth-over-time"] = {
  get: {
    tags: ["Report"],
    summary: "Lấy báo cáo tăng trưởng access log theo thời gian",
    description:
      "Trả về chuỗi thời gian tăng trưởng access log trong một khoảng thời gian chỉ định. Endpoint phù hợp cho biểu đồ xu hướng truy cập và đối chiếu mức tăng trưởng giữa các giai đoạn.",
    operationId: "getAccessLogGrowthOverTime",
    parameters: [
      {
        name: "startDate",
        in: "query",
        required: false,
        description:
          "Mốc bắt đầu của báo cáo, định dạng ISO 8601. Nếu bỏ trống, backend có thể tự suy ra theo `days`.",
        schema: {
          type: "string",
          format: "date-time",
        },
      },
      {
        name: "endDate",
        in: "query",
        required: false,
        description:
          "Mốc kết thúc của báo cáo, định dạng ISO 8601. Nếu bỏ trống, backend có thể dùng thời điểm hiện tại.",
        schema: {
          type: "string",
          format: "date-time",
        },
      },
      {
        name: "days",
        in: "query",
        required: false,
        description:
          "Số ngày gần nhất cần thống kê khi không truyền `startDate` và `endDate`, mặc định `30`.",
        schema: {
          type: "integer",
          format: "int32",
          default: 30,
        },
      },
      {
        name: "groupBy",
        in: "query",
        required: false,
        description:
          "Đơn vị gom nhóm chuỗi thời gian để vẽ biểu đồ tăng trưởng.",
        schema: {
          type: "string",
          enum: ["day", "week", "month"],
          default: "day",
        },
      },
    ],
    responses: {
      "200": {
        description:
          "Báo cáo tăng trưởng access log theo thời gian, gồm time series và tổng hợp tăng trưởng toàn kỳ.",
        content: {
          "*/*": {
            schema: {
              $ref: "#/components/schemas/ResponseDataTimeGrowthReportDTO",
            },
          },
        },
      },
    },
  },
};

const pathConfigs = {
  "/user-access-logs": {
    get: {
      description:
        "Trả về danh sách lịch sử truy cập có hỗ trợ lọc theo username, hệ điều hành, loại account và khoảng thời gian tạo log. Dữ liệu được phân trang để phù hợp với màn hình quản trị và export từng đợt.",
      parameters: {
        username: "Lọc theo tên đăng nhập chính xác hoặc theo chuỗi do backend hỗ trợ.",
        osOfDevice: "Lọc theo hệ điều hành hoặc tên thiết bị, ví dụ `Android 14`, `iOS 17`.",
        accountType: "Lọc theo loại account hoặc khoá, ví dụ `Khoá 66`.",
        createdFrom: "Mốc bắt đầu thời gian tạo log, định dạng ISO 8601.",
        createdTo: "Mốc kết thúc thời gian tạo log, định dạng ISO 8601.",
        page: "Số trang bắt đầu từ `0`.",
        size: "Số bản ghi trên mỗi trang.",
        sortBy: "Trường dùng để sắp xếp, mặc định là `createdAt`.",
        sortDirection: "Chiều sắp xếp: `asc` hoặc `desc`.",
      },
      responseDescription:
        "Danh sách log truy cập theo điều kiện lọc, kèm metadata phân trang.",
    },
  },
  "/user-access-logs/{id}": {
    get: {
      description:
        "Lấy chi tiết một bản ghi lịch sử truy cập theo ID để phục vụ điều tra hoặc đối chiếu dữ liệu trên dashboard.",
      responseDescription: "Thông tin chi tiết của một bản ghi access log.",
    },
  },
  "/user-access-logs/recent": {
    get: {
      description:
        "Lấy nhanh các bản ghi truy cập mới nhất để hiển thị trên dashboard hoặc widget hoạt động gần đây.",
      parameters: {
        limit: "Số lượng bản ghi muốn lấy, mặc định `10`.",
      },
      responseDescription: "Danh sách access log mới nhất theo thời gian giảm dần.",
    },
  },
  "/user-access-logs/by-username/{username}": {
    get: {
      description:
        "Truy vấn bản ghi truy cập đầu tiên tìm thấy theo username. Endpoint phù hợp cho các màn hình tra cứu nhanh theo người dùng.",
      responseDescription: "Một bản ghi access log tương ứng với username được yêu cầu.",
    },
  },
  "/report/dashboard": {
    get: {
      tags: ["Report"],
      summary: "Lấy dashboard báo cáo tổng hợp",
      description:
        "Trả về toàn bộ dữ liệu tổng hợp cho dashboard quản trị: thống kê account, batch, biểu đồ trạng thái, xu hướng tạo account, access log, thiết bị và các khối analytics/tăng trưởng theo kỳ.",
      responseDescription:
        "Dữ liệu dashboard tổng hợp để render một màn hình báo cáo đầy đủ.",
    },
  },
  "/report/accounts/summary": {
    get: {
      tags: ["Report"],
      summary: "Lấy tóm tắt account",
      description:
        "Trả về thông tin tóm tắt cấp cao về account để phục vụ thẻ KPI hoặc block overview. Endpoint này hiện trả về object tổng quát nên cần đối chiếu thêm với backend nếu muốn typed schema chặt hơn.",
      responseDescription: "Thông tin tóm tắt tổng quan về account.",
    },
  },
  "/report/accounts/statistics": {
    get: {
      tags: ["Report"],
      summary: "Lấy thống kê account",
      description:
        "Trả về thống kê account theo các mốc thời gian chuẩn như hôm nay, tuần này, tháng này và năm nay, kèm account mới nhất và account cũ nhất.",
      responseDescription: "Khối thống kê account cho dashboard và báo cáo tổng quan.",
    },
  },
  "/report/accounts/recent": {
    get: {
      tags: ["Report"],
      summary: "Lấy account mới tạo gần đây",
      description:
        "Trả về danh sách account mới nhất theo thời gian tạo, thường dùng cho bảng recent accounts trên dashboard.",
      parameters: {
        limit: "Số lượng account muốn lấy, mặc định `10`.",
      },
      responseDescription: "Danh sách account mới tạo gần đây.",
    },
  },
  "/report/accounts/between": {
    get: {
      tags: ["Report"],
      summary: "Lấy account theo khoảng thời gian tạo",
      description:
        "Truy vấn toàn bộ account được tạo trong một khoảng thời gian xác định. Phù hợp cho export dữ liệu hoặc tạo báo cáo chiến dịch theo giai đoạn.",
      parameters: {
        startDate: "Thời điểm bắt đầu, định dạng ISO 8601.",
        endDate: "Thời điểm kết thúc, định dạng ISO 8601.",
      },
      responseDescription: "Danh sách account được tạo trong khoảng thời gian yêu cầu.",
    },
  },
  "/report/accounts/batches/{batchCode}": {
    get: {
      tags: ["Report"],
      summary: "Lấy báo cáo chi tiết theo batch",
      description:
        "Trả về báo cáo chi tiết của một batch account, bao gồm tổng số account, phân loại trạng thái và danh sách account thuộc batch đó.",
      responseDescription: "Báo cáo chi tiết của batch account theo mã batch.",
    },
  },
  "/report/accounts/batches/{batchCode}/summary": {
    get: {
      tags: ["Report"],
      summary: "Lấy tóm tắt một batch",
      description:
        "Trả về dữ liệu tóm tắt cho một batch cụ thể. Do schema hiện là object tổng quát, nên frontend cần kiểm tra contract backend nếu muốn sử dụng trực tiếp.",
      responseDescription: "Thông tin tóm tắt của batch theo mã batch.",
    },
  },
  "/report/accounts/batches/summary": {
    get: {
      tags: ["Report"],
      summary: "Lấy tổng quan các batch account",
      description:
        "Trả về bức tranh tổng quan theo batch: tổng số account, số batch, batch lớn nhất/nhỏ nhất và danh sách report chi tiết của từng batch.",
      responseDescription: "Tổng quan toàn bộ batch account.",
    },
  },
  "/report/accounts/batches/stats/{batchCode}": {
    get: {
      tags: ["Report"],
      summary: "Lấy thống kê trạng thái theo batch",
      description:
        "Trả về thống kê trạng thái account của một batch cụ thể mà không kèm danh sách account chi tiết.",
      responseDescription: "Thống kê trạng thái account của batch theo mã batch.",
    },
  },
  "/report/accounts/batches/stats/{batchCode}/summary": {
    get: {
      tags: ["Report"],
      summary: "Lấy tóm tắt thống kê trạng thái của batch",
      description:
        "Trả về object tóm tắt thống kê cho batch cụ thể. Schema hiện chưa được typed chi tiết trong spec gốc.",
      responseDescription: "Thông tin tóm tắt thống kê trạng thái của batch.",
    },
  },
  "/report/accounts/batches/stats/summary": {
    get: {
      tags: ["Report"],
      summary: "Lấy tổng hợp thống kê trạng thái theo batch",
      description:
        "Trả về tổng hợp trạng thái account trên toàn bộ batch, bao gồm số lượng active, inactive, dormant, unknown và danh sách thống kê theo từng batch.",
      responseDescription: "Tổng hợp thống kê trạng thái của toàn bộ batch account.",
    },
  },
  "/report/accounts/batches/stats/all": {
    get: {
      tags: ["Report"],
      summary: "Lấy toàn bộ thống kê batch",
      description:
        "Trả về danh sách thống kê trạng thái của tất cả batch để phục vụ biểu đồ, bảng đối chiếu hoặc export.",
      responseDescription: "Danh sách thống kê trạng thái của tất cả batch.",
    },
  },
  "/report/accounts/batches/codes": {
    get: {
      tags: ["Report"],
      summary: "Lấy danh sách mã batch",
      description:
        "Trả về toàn bộ mã batch hiện có để dùng cho dropdown filter hoặc đối chiếu dữ liệu báo cáo.",
      responseDescription: "Danh sách mã batch.",
    },
  },
  "/report/accounts/batches/all": {
    get: {
      tags: ["Report"],
      summary: "Lấy toàn bộ báo cáo batch",
      description:
        "Trả về đầy đủ các batch report, bao gồm tổng hợp từng batch và dữ liệu danh sách account nếu backend cung cấp.",
      responseDescription: "Danh sách đầy đủ báo cáo batch account.",
    },
  },
  "/report/accounts/analytics": {
    get: {
      tags: ["Report"],
      summary: "Lấy phân tích và báo cáo tăng trưởng account",
      description:
        "Trả về bộ dữ liệu analytics của account trong số ngày gần nhất, bao gồm tổng số account, biểu đồ theo loại, biểu đồ theo ngày/giờ và khối tăng trưởng so sánh giữa kỳ hiện tại với kỳ trước liền kề.",
      parameters: {
        days: "Số ngày gần nhất cần phân tích, mặc định `30`.",
      },
      responseDescription:
        "Báo cáo phân tích account và tăng trưởng theo kỳ để hiển thị xu hướng.",
    },
  },
  "/report/accounts/all": {
    get: {
      tags: ["Report"],
      summary: "Lấy toàn bộ account phục vụ báo cáo",
      description:
        "Trả về toàn bộ account dưới dạng report DTO để phục vụ dashboard, bảng tổng hợp hoặc export dữ liệu.",
      responseDescription: "Danh sách toàn bộ account ở định dạng report.",
    },
  },
  "/report/access-logs/analytics": {
    get: {
      tags: ["Report"],
      summary: "Lấy phân tích và báo cáo tăng trưởng access log",
      description:
        "Trả về bộ dữ liệu analytics của access log trong số ngày gần nhất, bao gồm tổng lượt truy cập, phân bố theo loại account, biểu đồ theo ngày/giờ và tốc độ tăng trưởng giữa hai kỳ liên tiếp.",
      parameters: {
        days: "Số ngày gần nhất cần phân tích, mặc định `30`.",
      },
      responseDescription:
        "Báo cáo phân tích access log và tăng trưởng theo kỳ.",
    },
  },
  "/account/{id}": {
    get: {
      description:
        "Lấy thông tin chi tiết của một account theo ID. Dùng cho màn hình xem chi tiết hoặc thao tác đối chiếu dữ liệu.",
      responseDescription: "Thông tin chi tiết của account.",
    },
  },
  "/account/random": {
    get: {
      description:
        "Lấy ngẫu nhiên một account để kiểm thử nhanh, demo dữ liệu hoặc sanity check backend.",
      responseDescription: "Một account ngẫu nhiên.",
    },
  },
  "/account/query": {
    get: {
      description:
        "Truy vấn danh sách account có hỗ trợ lọc theo username, ngày tạo, ngày cập nhật, phân trang và sắp xếp. Endpoint này phù hợp cho bảng quản trị account.",
      parameters: {
        username: "Lọc theo tên đăng nhập.",
        createdFrom: "Mốc bắt đầu ngày tạo account, định dạng ISO 8601.",
        createdTo: "Mốc kết thúc ngày tạo account, định dạng ISO 8601.",
        updatedFrom: "Mốc bắt đầu ngày cập nhật account, định dạng ISO 8601.",
        updatedTo: "Mốc kết thúc ngày cập nhật account, định dạng ISO 8601.",
        page: "Số trang bắt đầu từ `0`.",
        size: "Số bản ghi trên mỗi trang.",
        sortBy: "Trường dùng để sắp xếp, mặc định là `createdAt`.",
        sortDirection: "Chiều sắp xếp: `asc` hoặc `desc`.",
      },
      responseDescription:
        "Danh sách account theo điều kiện lọc, kèm metadata phân trang.",
    },
  },
  "/account/by-username/{username}": {
    get: {
      description:
        "Lấy thông tin account theo username để hỗ trợ tìm kiếm nhanh từ giao diện quản trị.",
      responseDescription: "Thông tin account tương ứng với username.",
    },
  },
  "/account/accounts": {
    get: {
      description:
        "Lấy danh sách N account gần nhất hoặc số lượng account theo cấu hình để phục vụ preview nhanh.",
      parameters: {
        num: "Số lượng account muốn lấy, mặc định `10`.",
      },
      responseDescription: "Danh sách account được trả về theo số lượng yêu cầu.",
    },
  },
};

for (const [route, routeConfig] of Object.entries(pathConfigs)) {
  const pathItem = spec.paths[route];
  if (!pathItem) continue;

  for (const [method, methodConfig] of Object.entries(routeConfig)) {
    const operation = pathItem[method];
    if (!operation) continue;

    if (methodConfig.tags) {
      operation.tags = methodConfig.tags;
    }

    if (methodConfig.summary) {
      operation.summary = methodConfig.summary;
    }

    if (methodConfig.description) {
      operation.description = methodConfig.description;
    }

    if (methodConfig.parameters) {
      operation.parameters = addParamDescriptions(
        operation.parameters,
        methodConfig.parameters
      );
    }

    if (methodConfig.responseDescription && operation.responses?.["200"]) {
      operation.responses["200"].description = methodConfig.responseDescription;
    }
  }
}

const schema = spec.components.schemas;

schema.PageResponseDTOUserAccessLogInfoDTO.description =
  "Kết quả phân trang cho danh sách access log.";
schema.PageResponseDTOAccountInfoDTO.description =
  "Kết quả phân trang cho danh sách account.";

schema.ResponseDataPageResponseDTOUserAccessLogInfoDTO.description =
  "Response chuẩn bọc dữ liệu phân trang access log.";
schema.ResponseDataUserAccessLogs.description =
  "Response chuẩn bọc dữ liệu chi tiết access log.";
schema.ResponseDataListUserAccessLogInfoDTO.description =
  "Response chuẩn bọc danh sách access log.";
schema.ResponseDataAccountStatisticsDTO.description =
  "Response chuẩn bọc dữ liệu thống kê account.";
schema.ResponseDataListAccountReportDTO.description =
  "Response chuẩn bọc danh sách account report.";
schema.ResponseDataAccountBatchReportDTO.description =
  "Response chuẩn bọc báo cáo chi tiết một batch.";
schema.ResponseDataAccountBatchSummaryDTO.description =
  "Response chuẩn bọc tổng quan batch account.";
schema.ResponseDataAccountBatchStatsDTO.description =
  "Response chuẩn bọc thống kê trạng thái của một batch.";
schema.ResponseDataAccountBatchStatsSummaryDTO.description =
  "Response chuẩn bọc tổng hợp thống kê trạng thái theo batch.";
schema.ResponseDataListAccountBatchStatsDTO.description =
  "Response chuẩn bọc danh sách thống kê trạng thái các batch.";
schema.ResponseDataListString.description =
  "Response chuẩn bọc danh sách chuỗi, thường dùng cho mã batch.";
schema.ResponseDataListAccountBatchReportDTO.description =
  "Response chuẩn bọc danh sách báo cáo batch account.";
schema.ResponseDataAccountAnalyticsDTO.description =
  "Response chuẩn bọc dữ liệu analytics và tăng trưởng account.";
schema.ResponseDataAccessLogAnalyticsDTO.description =
  "Response chuẩn bọc dữ liệu analytics và tăng trưởng access log.";
schema.ResponseDataTimeGrowthReportDTO = {
  type: "object",
  description:
    "Response chuẩn bọc báo cáo tăng trưởng theo thời gian cho account hoặc access log.",
  properties: {
    status: { type: "integer", format: "int32", description: "Mã trạng thái xử lý." },
    message: { type: "string", description: "Thông điệp từ backend." },
    data: { $ref: "#/components/schemas/TimeGrowthReportDTO" },
  },
};
schema.ResponseDataAccountInfoDTO.description =
  "Response chuẩn bọc thông tin account.";
schema.ResponseDataPageResponseDTOAccountInfoDTO.description =
  "Response chuẩn bọc dữ liệu phân trang account.";
schema.ResponseDataReportDashboardDTO.description =
  "Response chuẩn bọc dữ liệu dashboard tổng hợp.";

schema.UserAccessLogs.description =
  "Bản ghi access log dạng cơ bản, thường dùng cho các endpoint tra cứu chi tiết hoặc theo username.";
schema.AccessLogAnalyticsDTO.description =
  "Báo cáo phân tích access log trong một khoảng ngày gần nhất, bao gồm biểu đồ và số liệu tăng trưởng theo kỳ.";
schema.AccountAnalyticsDTO.description =
  "Báo cáo phân tích account trong một khoảng ngày gần nhất, bao gồm biểu đồ phân bổ, xu hướng theo ngày/giờ và tăng trưởng theo kỳ.";
schema.AccountBatchReportDTO.description =
  "Báo cáo chi tiết của một batch account.";
schema.AccountBatchStatsDTO.description =
  "Thống kê trạng thái account của một batch, không bao gồm danh sách account chi tiết.";
schema.AccountBatchStatsSummaryDTO.description =
  "Khối tổng hợp thống kê trạng thái trên toàn bộ batch account.";
schema.AccountBatchSummaryDTO.description =
  "Khối tổng quan toàn bộ batch account.";
schema.AccountReportDTO.description =
  "Thông tin account ở định dạng phục vụ báo cáo và dashboard.";
schema.AccountStatisticsDTO.description =
  "Khối thống kê account theo các mốc thời gian tiêu chuẩn.";
schema.CategoryCountDTO.description =
  "Cặp nhãn - giá trị dùng cho biểu đồ cột, tròn hoặc timeline đơn giản.";
schema.PeriodGrowthDTO.description =
  "Thông tin tăng trưởng giữa hai kỳ liên tiếp, dùng để so sánh xu hướng hiện tại với kỳ trước.";
schema.TimeSeriesPointDTO = {
  type: "object",
  description:
    "Một điểm dữ liệu trong chuỗi thời gian, dùng để dựng biểu đồ tăng trưởng.",
  properties: {
    label: {
      type: "string",
      description: "Nhãn hiển thị của mốc thời gian, ví dụ `2026-06-01` hoặc `Tuần 24`.",
      example: "2026-06-01",
    },
    timestamp: {
      type: "string",
      format: "date-time",
      description: "Thời điểm đại diện cho bucket thời gian.",
    },
    value: {
      type: "integer",
      format: "int64",
      description: "Giá trị phát sinh trong bucket thời gian này.",
      example: 18,
    },
    cumulativeValue: {
      type: "integer",
      format: "int64",
      description:
        "Giá trị luỹ kế đến hết mốc thời gian hiện tại. Hữu ích cho area chart tăng trưởng tích luỹ.",
      example: 240,
    },
    growthRatePercent: {
      type: "number",
      format: "double",
      description:
        "Tỷ lệ tăng trưởng của bucket hiện tại so với bucket liền trước. Có thể âm nếu giảm.",
      example: 12.5,
    },
  },
};
schema.TimeGrowthReportDTO = {
  type: "object",
  description:
    "Báo cáo tăng trưởng theo thời gian cho một loại dữ liệu như account hoặc access log.",
  properties: {
    metricType: {
      type: "string",
      description: "Loại dữ liệu đang được thống kê.",
      example: "account",
    },
    groupBy: {
      type: "string",
      description: "Đơn vị gom nhóm của chuỗi thời gian.",
      enum: ["day", "week", "month"],
      example: "day",
    },
    startDate: {
      type: "string",
      format: "date-time",
      description: "Mốc bắt đầu của khoảng thời gian báo cáo.",
    },
    endDate: {
      type: "string",
      format: "date-time",
      description: "Mốc kết thúc của khoảng thời gian báo cáo.",
    },
    totalInRange: {
      type: "integer",
      format: "int64",
      description: "Tổng số bản ghi phát sinh trong toàn bộ khoảng thời gian được chọn.",
      example: 240,
    },
    averagePerBucket: {
      type: "number",
      format: "double",
      description: "Giá trị trung bình trên mỗi bucket thời gian.",
      example: 8,
    },
    growthSummary: {
      $ref: "#/components/schemas/PeriodGrowthDTO",
      description: "Tổng hợp tăng trưởng của kỳ hiện tại so với kỳ trước.",
    },
    timeline: {
      type: "array",
      description: "Danh sách các điểm dữ liệu theo thời gian để render biểu đồ tăng trưởng.",
      items: {
        $ref: "#/components/schemas/TimeSeriesPointDTO",
      },
    },
  },
};
schema.ReportDashboardDTO.description =
  "Payload dashboard tổng hợp mọi khối báo cáo chính phục vụ màn hình quản trị.";
schema.Account.description =
  "Thực thể account gốc do backend trả về ở một số endpoint đặc thù.";

Object.assign(schema.PeriodGrowthDTO.properties, {
  currentPeriodLabel: {
    ...schema.PeriodGrowthDTO.properties.currentPeriodLabel,
    description: "Nhãn của kỳ hiện tại, ví dụ `30 ngày gần nhất`.",
    example: "30 ngay gan nhat",
  },
  previousPeriodLabel: {
    ...schema.PeriodGrowthDTO.properties.previousPeriodLabel,
    description: "Nhãn của kỳ liền trước để so sánh.",
    example: "30 ngay truoc do",
  },
  currentCount: {
    ...schema.PeriodGrowthDTO.properties.currentCount,
    description: "Tổng số bản ghi trong kỳ hiện tại.",
    example: 240,
  },
  previousCount: {
    ...schema.PeriodGrowthDTO.properties.previousCount,
    description: "Tổng số bản ghi trong kỳ trước.",
    example: 180,
  },
  difference: {
    ...schema.PeriodGrowthDTO.properties.difference,
    description: "Chênh lệch tuyệt đối giữa kỳ hiện tại và kỳ trước.",
    example: 60,
  },
  growthRatePercent: {
    ...schema.PeriodGrowthDTO.properties.growthRatePercent,
    description:
      "Tỷ lệ tăng trưởng phần trăm. Giá trị âm thể hiện suy giảm, giá trị dương thể hiện tăng trưởng.",
    example: 33.33,
  },
});

Object.assign(schema.AccessLogAnalyticsDTO.properties, {
  generatedAt: {
    ...schema.AccessLogAnalyticsDTO.properties.generatedAt,
    description: "Thời điểm backend tạo báo cáo analytics.",
  },
  totalAccessLogs: {
    ...schema.AccessLogAnalyticsDTO.properties.totalAccessLogs,
    description: "Tổng số access log trong phạm vi dữ liệu được phân tích.",
  },
  accountTypeChart: {
    ...schema.AccessLogAnalyticsDTO.properties.accountTypeChart,
    description: "Phân bố access log theo loại account hoặc khoá.",
  },
  dailyChart: {
    ...schema.AccessLogAnalyticsDTO.properties.dailyChart,
    description: "Biểu đồ số lượng access log theo từng ngày.",
  },
  hourlyChart: {
    ...schema.AccessLogAnalyticsDTO.properties.hourlyChart,
    description: "Biểu đồ số lượng access log theo khung giờ trong ngày.",
  },
  growth: {
    ...schema.AccessLogAnalyticsDTO.properties.growth,
    description: "Khối báo cáo tăng trưởng access log giữa hai kỳ liên tiếp.",
  },
});

Object.assign(schema.AccountAnalyticsDTO.properties, {
  generatedAt: {
    ...schema.AccountAnalyticsDTO.properties.generatedAt,
    description: "Thời điểm backend tạo báo cáo analytics.",
  },
  totalAccounts: {
    ...schema.AccountAnalyticsDTO.properties.totalAccounts,
    description: "Tổng số account trong phạm vi dữ liệu được phân tích.",
  },
  accountTypeChart: {
    ...schema.AccountAnalyticsDTO.properties.accountTypeChart,
    description: "Phân bố account theo loại hoặc khoá.",
  },
  dailyChart: {
    ...schema.AccountAnalyticsDTO.properties.dailyChart,
    description: "Biểu đồ số lượng account được tạo theo từng ngày.",
  },
  hourlyChart: {
    ...schema.AccountAnalyticsDTO.properties.hourlyChart,
    description: "Biểu đồ số lượng account được tạo theo từng giờ.",
  },
  growth: {
    ...schema.AccountAnalyticsDTO.properties.growth,
    description: "Khối báo cáo tăng trưởng account giữa hai kỳ liên tiếp.",
  },
  statistics: {
    ...schema.AccountAnalyticsDTO.properties.statistics,
    description: "Khối thống kê account chi tiết theo các mốc thời gian chuẩn.",
  },
});

Object.assign(schema.ReportDashboardDTO.properties, {
  generatedAt: {
    ...schema.ReportDashboardDTO.properties.generatedAt,
    description: "Thời điểm tạo snapshot dashboard.",
  },
  accountStatistics: {
    ...schema.ReportDashboardDTO.properties.accountStatistics,
    description: "Khối thống kê account theo hôm nay, tuần, tháng, năm.",
  },
  accountBatchSummary: {
    ...schema.ReportDashboardDTO.properties.accountBatchSummary,
    description: "Khối tổng quan batch account.",
  },
  accountBatchStatsSummary: {
    ...schema.ReportDashboardDTO.properties.accountBatchStatsSummary,
    description: "Khối tổng hợp trạng thái account theo batch.",
  },
  totalReviews: {
    ...schema.ReportDashboardDTO.properties.totalReviews,
    description: "Tổng số review thu thập được từ người dùng.",
  },
  totalDevices: {
    ...schema.ReportDashboardDTO.properties.totalDevices,
    description: "Tổng số thiết bị đã ghi nhận.",
  },
  totalAccessLogs: {
    ...schema.ReportDashboardDTO.properties.totalAccessLogs,
    description: "Tổng số bản ghi truy cập.",
  },
  recentAccounts: {
    ...schema.ReportDashboardDTO.properties.recentAccounts,
    description: "Danh sách account mới nhất.",
  },
  allAccounts: {
    ...schema.ReportDashboardDTO.properties.allAccounts,
    description: "Danh sách toàn bộ account ở dạng report.",
  },
  accountBatches: {
    ...schema.ReportDashboardDTO.properties.accountBatches,
    description: "Danh sách report theo từng batch.",
  },
  accountBatchStats: {
    ...schema.ReportDashboardDTO.properties.accountBatchStats,
    description: "Danh sách thống kê trạng thái theo từng batch.",
  },
  accountStatusChart: {
    ...schema.ReportDashboardDTO.properties.accountStatusChart,
    description: "Biểu đồ phân bố trạng thái account.",
  },
  accountCreationChart: {
    ...schema.ReportDashboardDTO.properties.accountCreationChart,
    description: "Biểu đồ timeline tạo account.",
  },
  accessLogOsChart: {
    ...schema.ReportDashboardDTO.properties.accessLogOsChart,
    description: "Biểu đồ phân bố access log theo hệ điều hành thiết bị.",
  },
  deviceOsChart: {
    ...schema.ReportDashboardDTO.properties.deviceOsChart,
    description: "Biểu đồ phân bố thiết bị theo hệ điều hành.",
  },
  reviewTimelineChart: {
    ...schema.ReportDashboardDTO.properties.reviewTimelineChart,
    description: "Biểu đồ timeline review của người dùng.",
  },
  accessLogAnalytics: {
    ...schema.ReportDashboardDTO.properties.accessLogAnalytics,
    description: "Khối analytics và tăng trưởng access log.",
  },
  accountAnalytics: {
    ...schema.ReportDashboardDTO.properties.accountAnalytics,
    description: "Khối analytics và tăng trưởng account.",
  },
  accountGrowthOverTime: {
    $ref: "#/components/schemas/TimeGrowthReportDTO",
    description: "Khối báo cáo tăng trưởng account theo chuỗi thời gian.",
  },
  accessLogGrowthOverTime: {
    $ref: "#/components/schemas/TimeGrowthReportDTO",
    description: "Khối báo cáo tăng trưởng access log theo chuỗi thời gian.",
  },
});

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(spec, null, 2)}\n`);
console.log(outputPath);
