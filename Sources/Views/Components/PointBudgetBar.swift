import SwiftUI

struct PointBudgetBar: View {
    let current: Int
    let budget: Int
    let color: Color

    private var progress: Double {
        guard budget > 0 else { return 0 }
        return min(Double(current) / Double(budget), 1.0)
    }

    private var isOverBudget: Bool { current > budget }

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color.secondary.opacity(0.2))

                RoundedRectangle(cornerRadius: 2)
                    .fill(isOverBudget ? Color.red : color)
                    .frame(width: geometry.size.width * progress)
                    .animation(.easeInOut(duration: 0.3), value: progress)
            }
        }
    }
}
