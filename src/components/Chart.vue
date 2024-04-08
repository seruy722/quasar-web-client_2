<script>
import { Line } from "vue-chartjs";
import { isEmpty } from "lodash";

export default {
  name: "ChartComponent",
  extends: Line,
  props: {
    chartdata: {
      type: Object,
      default: null,
    },
    options: {
      type: Object,
      default: null,
    },
  },
  mounted() {
    this.setChart(this.chartdata, this.options);
  },
  methods: {
    setChart(chartdata, options) {
      if (!isEmpty(chartdata)) {
        this.renderChart(chartdata, options);
      }
    },
  },
};
</script>
