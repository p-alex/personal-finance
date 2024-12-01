import TimeConverter from "../TimeConverter";

describe("TimeConverter", () => {
  let timeConverter: TimeConverter;

  beforeEach(() => {
    timeConverter = new TimeConverter();
  });

  describe("toMs", () => {
    it("should convert milliseconds to ms correctly", () => {
      expect(timeConverter.toMs(500, "milisecond")).toEqual(500);
    });

    it("should convert seconds to ms correctly", () => {
      expect(timeConverter.toMs(2, "second")).toEqual(2000);
    });

    it("should convert minutes to ms correctly", () => {
      expect(timeConverter.toMs(3, "minute")).toEqual(3 * 60 * 1000);
    });

    it("should convert hours to ms correctly", () => {
      expect(timeConverter.toMs(1, "hour")).toEqual(1000 * 60 * 60);
    });

    it("should convert days to ms correctly", () => {
      expect(timeConverter.toMs(2, "day")).toEqual(2 * 24 * 60 * 60 * 1000);
    });

    it("should convert months to ms correctly", () => {
      expect(timeConverter.toMs(1, "month")).toEqual(30 * 24 * 60 * 60 * 1000);
    });

    it("should convert years to ms correctly", () => {
      expect(timeConverter.toMs(1, "year")).toEqual(12 * 30 * 24 * 60 * 60 * 1000);
    });
  });

  describe("toSeconds", () => {
    it("should convert milliseconds to seconds correctly", () => {
      expect(timeConverter.toSeconds(2000, "milisecond")).toEqual(2);
    });

    it("should convert seconds to seconds correctly", () => {
      expect(timeConverter.toSeconds(30, "second")).toEqual(30);
    });

    it("should convert minutes to seconds correctly", () => {
      expect(timeConverter.toSeconds(2, "minute")).toEqual(120);
    });

    it("should convert hours to seconds correctly", () => {
      expect(timeConverter.toSeconds(1, "hour")).toEqual(3600);
    });

    it("should convert days to seconds correctly", () => {
      expect(timeConverter.toSeconds(1, "day")).toEqual(86400);
    });

    it("should convert months to seconds correctly", () => {
      expect(timeConverter.toSeconds(1, "month")).toEqual(2592000);
    });

    it("should convert years to seconds correctly", () => {
      expect(timeConverter.toSeconds(1, "year")).toEqual(31104000);
    });

    it("should round down to nearest second", () => {
      expect(timeConverter.toSeconds(1.7, "second")).toEqual(1);
    });
  });
});
