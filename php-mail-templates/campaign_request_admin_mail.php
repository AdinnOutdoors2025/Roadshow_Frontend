<?php
/* =========================================================
   ROADSHOW CAMPAIGN REQUEST — ADMIN EMAIL TEMPLATE

   Expected variables from index.php:
     $mailData
     $clientOrderId
     $createdAt
     $status
     $customer
     $vehicles
     $pricing
     $adminRequestUrl

   This template only renders HTML. index.php sends the mail.
========================================================= */

if (!function_exists('rsAdminEscape')) {
    function rsAdminEscape($value)
    {
        return htmlspecialchars((string)($value ?? ''), ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('rsAdminMoney')) {
    function rsAdminMoney($value)
    {
        return '₹ ' . number_format((float)($value ?? 0), 2, '.', ',');
    }
}

if (!function_exists('rsAdminDate')) {
    function rsAdminDate($value)
    {
        if (empty($value)) return '-';
        try {
            $date = new DateTime($value);
            $date->setTimezone(new DateTimeZone('Asia/Kolkata'));
            return $date->format('d M Y');
        } catch (Exception $e) {
            return '-';
        }
    }
}

if (!function_exists('rsAdminDateTime')) {
    function rsAdminDateTime($value)
    {
        if (empty($value)) return '-';
        try {
            $date = new DateTime($value);
            $date->setTimezone(new DateTimeZone('Asia/Kolkata'));
            return $date->format('d M Y, h:i A');
        } catch (Exception $e) {
            return '-';
        }
    }
}

if (!function_exists('rsAdminVehicleName')) {
    function rsAdminVehicleName($vehicle)
    {
        if (!empty($vehicle['vehicleName'])) return $vehicle['vehicleName'];
        if (!empty($vehicle['vehicleModel'])) return $vehicle['vehicleModel'];
        if (!empty($vehicle['vehicleType']) && is_array($vehicle['vehicleType']) && !empty($vehicle['vehicleType']['name'])) {
            return $vehicle['vehicleType']['name'];
        }
        if (!empty($vehicle['vehicleType']) && is_string($vehicle['vehicleType'])) return $vehicle['vehicleType'];
        return 'Roadshow Vehicle';
    }
}

$mailData = is_array($mailData ?? null) ? $mailData : [];
$customer = is_array($customer ?? null) ? $customer : ($mailData['customer'] ?? []);
$vehicles = is_array($vehicles ?? null) ? $vehicles : ($mailData['vehicles'] ?? []);
$pricing = is_array($pricing ?? null) ? $pricing : ($mailData['pricing'] ?? []);

$clientOrderId = $clientOrderId ?? $mailData['clientOrderId'] ?? $mailData['orderId'] ?? '-';
$createdAt = $createdAt ?? $mailData['createdAt'] ?? '';
$status = $status ?? $mailData['status'] ?? 0;
$adminRequestUrl = $adminRequestUrl ?? '';
$source = $mailData['source'] ?? '';

$customerName = $customer['name'] ?? '-';
$customerEmail = $customer['email'] ?? '-';
$customerPhone = $customer['phone'] ?? '-';
$customerCategory = $customer['customerCategory'] ?? 'individual';
$companyName = $customer['companyName'] ?? '';
$clientName = $customer['clientName'] ?? '';
$designation = $customer['designation'] ?? '';
$gstNumber = $customer['gstNumber'] ?? '';
$panNumber = $customer['panNumber'] ?? '';
$address = $customer['address'] ?? '';

$statusLabels = [
    0 => 'Request Submitted',
    1 => 'In Progress',
    2 => 'Converted to Order',
];
$statusLabel = $statusLabels[(int)$status] ?? 'Request Submitted';

$subtotal = (float)($pricing['subtotal'] ?? 0);
$promoterTotal = (float)($pricing['promoterTotal'] ?? 0);
$gstPercentage = (float)($pricing['gstPercentage'] ?? 0);
$gstAmount = (float)($pricing['gstAmount'] ?? 0);
$cgstAmount = (float)($pricing['cgstAmount'] ?? 0);
$sgstAmount = (float)($pricing['sgstAmount'] ?? 0);
$igstAmount = (float)($pricing['igstAmount'] ?? 0);
$estimatedTotal = (float)($pricing['estimatedTotal'] ?? 0);

/* Amounts come pre-formatted (Indian format, e.g. "1,02,660.00") in the
   payload as <field>Formatted — printed as-is, no formatting here. The
   numeric variables above are still used for the > 0 checks. */
if (!function_exists('rsAdminAmount')) {
    function rsAdminAmount($source, $key)
    {
        $value = $source[$key . 'Formatted'] ?? $source[$key] ?? '0.00';
        return '₹ ' . rsAdminEscape($value);
    }
}

$totalVehicleCount = 0;
foreach ($vehicles as $vehicle) {
    $totalVehicleCount += max((int)($vehicle['quantity'] ?? 1), 1);
}

$logoUrl = 'https://adinndigital.com/api/roadshows/assets/Roadshow_AdinnLogo.png';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>New Roadshow Campaign Request</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#000000;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:1200px;background:#000000;background-image:url('https://www.adinnoutdoors.com/images/adinnMailBackground.svg');background-size:cover;background-repeat:no-repeat;background-position:center top;">
<tr><td style="padding:45px 6% 0;">
    <table cellpadding="0" cellspacing="0" border="0" style="background:#1d1d1d;border-radius:10px;">
        <tr><td style="padding:10px 15px;"><img src="https://adinnoutdoors.com/images/adinnHeaderlogo.svg" alt="Adinn Logo" style="height:50px;display:block;border:0;"></td></tr>
    </table>
</td></tr>
<tr><td style="padding:55px 6% 85px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:rgba(24,24,24,.94);border:1px solid #4a2727;border-radius:30px;">
<tr><td style="padding:42px 42px 24px;">
    <div style="font-size:17px;font-weight:700;color:#ffffff;">Hello Team</div>
    <div style="margin-top:15px;font-size:38px;line-height:1.15;font-weight:800;color:#C0392B;">New Roadshow Campaign Request</div>
    <div style="margin-top:12px;font-size:15px;line-height:1.7;color:#e6e6e6;">A new roadshow campaign request has been received. Review the customer, campaign, vehicle and pricing details below and continue the request from Sales Handling.</div>
</td></tr>

<tr><td style="padding:8px 42px 24px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#151515;border:1px solid #3d3d3d;border-radius:14px;">
<tr>
<td width="25%" valign="top" style="padding:17px;border-right:1px solid #333333;"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#999999;font-weight:700;">Request ID</div><div style="margin-top:7px;font-size:13px;font-weight:700;color:#E31F25;word-break:break-word;"><?= rsAdminEscape($clientOrderId) ?></div></td>
<td width="25%" valign="top" style="padding:17px;border-right:1px solid #333333;"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#999999;font-weight:700;">Submitted On</div><div style="margin-top:7px;font-size:12px;font-weight:600;color:#ffffff;"><?= rsAdminEscape(rsAdminDateTime($createdAt)) ?></div></td>
<td width="25%" valign="top" style="padding:17px;border-right:1px solid #333333;"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#999999;font-weight:700;">Status</div><div style="margin-top:7px;font-size:12px;font-weight:700;color:#65d28c;"><?= rsAdminEscape($statusLabel) ?></div></td>
<td width="25%" valign="top" style="padding:17px;"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:#999999;font-weight:700;">Source</div><div style="margin-top:7px;font-size:12px;font-weight:700;color:#ffffff;"><?= rsAdminEscape($source === 'admin' ? 'Admin Order' : 'Client Request') ?></div></td>
</tr></table>
</td></tr>

<tr><td style="padding:2px 42px 10px;"><div style="font-size:20px;font-weight:700;color:#ffffff;">Customer Details</div></td></tr>
<tr><td style="padding:0 42px 26px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#151515;border:1px solid #3d3d3d;border-radius:14px;">
<tr>
<td width="50%" valign="top" style="padding:18px;border-right:1px solid #333333;">
<div style="font-size:14px;font-weight:700;color:#ffffff;"><?= rsAdminEscape($customerName) ?></div>
<div style="margin-top:7px;font-size:12px;color:#c8c8c8;"><a href="mailto:<?= rsAdminEscape($customerEmail) ?>" style="color:#c8c8c8;text-decoration:none;"><?= rsAdminEscape($customerEmail) ?></a></div>
<div style="margin-top:5px;font-size:12px;color:#c8c8c8;"><a href="tel:<?= rsAdminEscape($customerPhone) ?>" style="color:#c8c8c8;text-decoration:none;"><?= rsAdminEscape($customerPhone) ?></a></div>
<?php if ($address): ?><div style="margin-top:5px;font-size:12px;line-height:1.6;color:#c8c8c8;"><?= rsAdminEscape($address) ?></div><?php endif; ?>
</td>
<td width="50%" valign="top" style="padding:18px;">
<div style="font-size:10px;color:#999999;font-weight:700;text-transform:uppercase;">Billing / GST</div>
<?php if ($customerCategory === 'organization' || $gstNumber): ?>
<?php if ($companyName): ?><div style="margin-top:7px;font-size:12px;font-weight:700;color:#ffffff;"><?= rsAdminEscape($companyName) ?></div><?php endif; ?>
<?php if ($clientName && $clientName !== $customerName): ?><div style="margin-top:5px;font-size:11.5px;color:#c8c8c8;">Client: <?= rsAdminEscape($clientName) ?></div><?php endif; ?>
<?php if ($designation): ?><div style="margin-top:5px;font-size:11.5px;color:#c8c8c8;">Designation: <?= rsAdminEscape($designation) ?></div><?php endif; ?>
<?php if ($gstNumber): ?><div style="margin-top:5px;font-size:11.5px;color:#c8c8c8;">GSTIN: <?= rsAdminEscape($gstNumber) ?></div><?php endif; ?>
<?php if ($panNumber): ?><div style="margin-top:5px;font-size:11.5px;color:#c8c8c8;">PAN: <?= rsAdminEscape($panNumber) ?></div><?php endif; ?>
<?php else: ?><div style="margin-top:7px;font-size:12px;font-weight:600;color:#ffffff;">Individual Customer</div><?php endif; ?>
</td>
</tr></table>
</td></tr>

<tr><td style="padding:2px 42px 10px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><div style="font-size:20px;font-weight:700;color:#ffffff;">Vehicle &amp; Campaign Details</div></td><td align="right"><div style="font-size:11px;color:#aaaaaa;"><?= $totalVehicleCount ?> vehicle<?= $totalVehicleCount === 1 ? '' : 's' ?></div></td></tr></table></td></tr>
<tr><td style="padding:0 42px 26px;">
<?php foreach ($vehicles as $index => $vehicle):
$vehicleName = rsAdminVehicleName($vehicle);
$quantity = max((int)($vehicle['quantity'] ?? 1), 1);
$fromDate = $vehicle['fromDate'] ?? '';
$toDate = $vehicle['toDate'] ?? '';
$days = (int)($vehicle['totalDays'] ?? 0);
$campaignType = $vehicle['campaignType'] ?? '';
$campaignName = $vehicle['campaignName'] ?? '';
$campaignLocation = $vehicle['campaignLocation'] ?? '';
$pricePerDay = (float)($vehicle['pricePerDay'] ?? $vehicle['perDayRentalCost'] ?? 0);
$rentalCost = (float)($vehicle['rentalCost'] ?? 0);
$lineTotal = (float)($vehicle['lineTotal'] ?? $vehicle['totalAmount'] ?? 0);
$needPromoter = !empty($vehicle['needPromoter']);
$promoterType = $vehicle['promoterType'] ?? '';
$promoterGender = $vehicle['promoterGender'] ?? '';
$promoterLanguages = is_array($vehicle['promoterLanguage'] ?? null) ? $vehicle['promoterLanguage'] : [];
$promoterQuantity = (int)($vehicle['promoterQuantity'] ?? 0);
$promoterCost = (float)($vehicle['promoterCost'] ?? 0);
?>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;background:#151515;border:1px solid #3d3d3d;border-radius:14px;">
<tr><td style="padding:15px 18px;border-bottom:1px solid #333333;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><div style="font-size:10px;font-weight:700;color:#999999;text-transform:uppercase;">Vehicle <?= $index + 1 ?></div><div style="margin-top:5px;font-size:15px;font-weight:700;color:#ffffff;"><?= rsAdminEscape($vehicleName) ?></div></td><td align="right"><div style="font-size:10px;color:#999999;">Quantity</div><div style="margin-top:3px;font-size:13px;font-weight:700;color:#ffffff;"><?= $quantity ?></div></td></tr></table></td></tr>
<tr><td style="padding:17px 18px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td width="33.33%" valign="top" style="padding-right:12px;"><div style="font-size:10px;font-weight:700;color:#999999;text-transform:uppercase;">Campaign Dates</div><div style="margin-top:6px;font-size:12px;font-weight:600;color:#ffffff;"><?= rsAdminEscape(rsAdminDate($fromDate)) ?> → <?= rsAdminEscape(rsAdminDate($toDate)) ?></div><?php if ($days > 0): ?><div style="margin-top:4px;font-size:11px;color:#bcbcbc;"><?= $days ?> <?= $days === 1 ? 'Day' : 'Days' ?></div><?php endif; ?></td>
<td width="33.33%" valign="top" style="padding-right:12px;"><div style="font-size:10px;font-weight:700;color:#999999;text-transform:uppercase;">Campaign</div><div style="margin-top:6px;font-size:12px;font-weight:600;color:#ffffff;"><?= rsAdminEscape($campaignName ?: '-') ?></div><?php if ($campaignType): ?><div style="margin-top:4px;font-size:11px;color:#bcbcbc;"><?= rsAdminEscape($campaignType) ?></div><?php endif; ?></td>
<td width="33.33%" valign="top"><div style="font-size:10px;font-weight:700;color:#999999;text-transform:uppercase;">Location</div><div style="margin-top:6px;font-size:12px;font-weight:600;color:#ffffff;"><?= rsAdminEscape($campaignLocation ?: '-') ?></div></td>
</tr>
<tr>
<td width="33.33%" valign="top" style="padding-top:16px;padding-right:12px;"><div style="font-size:10px;font-weight:700;color:#999999;text-transform:uppercase;">Rate / Day</div><div style="margin-top:6px;font-size:12px;font-weight:600;color:#ffffff;"><?= rsAdminAmount($vehicle, 'pricePerDay') ?></div></td>
<td width="33.33%" valign="top" style="padding-top:16px;padding-right:12px;"><div style="font-size:10px;font-weight:700;color:#999999;text-transform:uppercase;">Rental Cost</div><div style="margin-top:6px;font-size:12px;font-weight:600;color:#ffffff;"><?= rsAdminAmount($vehicle, 'rentalCost') ?></div></td>
<td width="33.33%" valign="top" style="padding-top:16px;"><div style="font-size:10px;font-weight:700;color:#999999;text-transform:uppercase;">Vehicle Total</div><div style="margin-top:6px;font-size:13px;font-weight:700;color:#E31F25;"><?= rsAdminAmount($vehicle, 'lineTotal') ?></div></td>
</tr></table>
<?php if ($needPromoter): ?>
<div style="margin-top:15px;padding:13px 14px;background:#202020;border:1px solid #363636;border-radius:9px;">
<div style="font-size:10px;font-weight:700;color:#999999;text-transform:uppercase;">Promoter Requirement</div>
<div style="margin-top:7px;font-size:12px;line-height:1.65;color:#e4e4e4;">
<?php $promoterInfo = []; if ($promoterType) $promoterInfo[] = $promoterType; if ($promoterGender) $promoterInfo[] = $promoterGender; if (!empty($promoterLanguages)) $promoterInfo[] = implode(', ', $promoterLanguages); if ($promoterQuantity > 0) $promoterInfo[] = 'Qty ' . $promoterQuantity; ?>
<?= rsAdminEscape(!empty($promoterInfo) ? implode(' · ', $promoterInfo) : 'Promoter required') ?><?php if ($promoterCost > 0): ?><span style="color:#ffffff;font-weight:700;"> · <?= rsAdminAmount($vehicle, 'promoterCost') ?></span><?php endif; ?>
</div></div>
<?php endif; ?>
</td></tr></table>
<?php endforeach; ?>
</td></tr>

<tr><td style="padding:2px 42px 10px;"><div style="font-size:20px;font-weight:700;color:#ffffff;">Pricing Summary</div></td></tr>
<tr><td style="padding:0 42px 24px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#151515;border:1px solid #3d3d3d;border-radius:14px;"><tr><td style="padding:18px 20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:7px 0;font-size:12px;color:#c6c6c6;">Taxable Amount</td><td align="right" style="padding:7px 0;font-size:12px;font-weight:700;color:#ffffff;"><?= rsAdminAmount($pricing, 'subtotal') ?></td></tr>
<?php if ($promoterTotal > 0): ?><tr><td style="padding:7px 0;font-size:12px;color:#c6c6c6;">Promoter Charges</td><td align="right" style="padding:7px 0;font-size:12px;font-weight:700;color:#ffffff;"><?= rsAdminAmount($pricing, 'promoterTotal') ?></td></tr><?php endif; ?>
<?php if ($cgstAmount > 0 || $sgstAmount > 0): ?>
<tr><td style="padding:7px 0;font-size:12px;color:#c6c6c6;">CGST <?= $gstPercentage > 0 ? '(' . ($gstPercentage / 2) . '%)' : '' ?></td><td align="right" style="padding:7px 0;font-size:12px;font-weight:700;color:#ffffff;"><?= rsAdminAmount($pricing, 'cgstAmount') ?></td></tr>
<tr><td style="padding:7px 0;font-size:12px;color:#c6c6c6;">SGST <?= $gstPercentage > 0 ? '(' . ($gstPercentage / 2) . '%)' : '' ?></td><td align="right" style="padding:7px 0;font-size:12px;font-weight:700;color:#ffffff;"><?= rsAdminAmount($pricing, 'sgstAmount') ?></td></tr>
<?php elseif ($igstAmount > 0): ?><tr><td style="padding:7px 0;font-size:12px;color:#c6c6c6;">IGST <?= $gstPercentage > 0 ? '(' . $gstPercentage . '%)' : '' ?></td><td align="right" style="padding:7px 0;font-size:12px;font-weight:700;color:#ffffff;"><?= rsAdminAmount($pricing, 'igstAmount') ?></td></tr>
<?php elseif ($gstAmount > 0): ?><tr><td style="padding:7px 0;font-size:12px;color:#c6c6c6;">GST <?= $gstPercentage > 0 ? '(' . $gstPercentage . '%)' : '' ?></td><td align="right" style="padding:7px 0;font-size:12px;font-weight:700;color:#ffffff;"><?= rsAdminAmount($pricing, 'gstAmount') ?></td></tr><?php endif; ?>
<tr><td colspan="2" style="padding-top:10px;"><div style="border-top:1px solid #3a3a3a;"></div></td></tr>
<tr><td style="padding-top:15px;font-size:14px;color:#ffffff;font-weight:700;">Estimated Total</td><td align="right" style="padding-top:15px;font-size:20px;color:#E31F25;font-weight:800;"><?= rsAdminAmount($pricing, 'estimatedTotal') ?></td></tr>
</table></td></tr></table>
</td></tr>

<tr><td style="padding:0 42px 22px;"><div style="padding:14px 16px;border:1px solid #5a4730;background:#241d15;border-radius:10px;font-size:11.5px;line-height:1.7;color:#dfc6a5;"><strong style="color:#ffffff;">Internal note:</strong> This is the submitted campaign estimate. Final pricing, availability, permits, logistics and any applicable location-specific charges should be validated by the sales/operations team.</div></td></tr>
<?php if (!empty($adminRequestUrl)): ?><tr><td align="center" style="padding:2px 42px 26px;"><a href="<?= rsAdminEscape($adminRequestUrl) ?>" target="_blank" style="display:inline-block;padding:13px 27px;background:#C0392B;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;border-radius:8px;">View Campaign Request</a></td></tr><?php endif; ?>
<!--/* NEW: OPTIONAL AGENCY PO */-->
<?php if (
    !empty(
        $mailData['poDocument']['url']
        ?? ''
    )
): ?>

<tr>
    <td
        style="
            padding:
                0
                42px
                22px;
        "
    >

        <div
            style="
                padding:
                    14px
                    16px;

                background:
                    #151515;

                border:
                    1px solid #3d3d3d;

                border-radius:
                    10px;
            "
        >

            <div
                style="
                    font-size:
                        10px;

                    font-weight:
                        700;

                    color:
                        #999999;

                    text-transform:
                        uppercase;
                "
            >
                Agency PO Document
            </div>


            <div
                style="
                    margin-top:
                        7px;

                    font-size:
                        12px;

                    color:
                        #ffffff;
                "
            >
                <?= rsAdminEscape(
                    $mailData['poDocument']['originalName']
                    ?? 'Agency PO.pdf'
                ) ?>
            </div>


            <div
                style="
                    margin-top:
                        8px;
                "
            >
                <a
                    href="<?= rsAdminEscape(
                        $mailData['poDocument']['url']
                    ) ?>"
                    target="_blank"
                    style="
                        color:
                            #E31F25;

                        font-size:
                            12px;

                        font-weight:
                            700;

                        text-decoration:
                            none;
                    "
                >
                    View Agency PO
                </a>
            </div>

        </div>

    </td>
</tr>

<?php endif; ?>
<!--/* NEW: OPTIONAL AGENCY PO */-->
<!--<tr><td style="padding:0 42px 38px;text-align:center;font-size:11.5px;line-height:1.7;color:#bdbdbd;">The complete Booking Summary PDF is attached for vehicle-wise pricing, GST and campaign details.</td></tr>-->
<tr>
    <td
        style="
            padding:0 42px 18px;
            text-align:center;
            font-size:11.5px;
            line-height:1.7;
            color:#bdbdbd;
        "
    >
        <?php if (!empty($hasBookingSummaryPdf)): ?>

            The complete Booking Summary PDF is attached for
            vehicle-wise pricing, GST and campaign details.

        <?php else: ?>

            The Booking Summary PDF could not be attached.
            Review the complete campaign details from Sales Handling.

        <?php endif; ?>
    </td>
</tr>

</table>
</td></tr>

<tr>
    <td
        align="center"
        style="
            padding:0 42px 38px;
            text-align:center;
            font-size:10.5px;
            line-height:1.6;
            color:#888888;
        "
    >
        This is a system-generated internal notification from
        Adinn Roadshow. No reply is required.
    </td>
</tr>

<!-- ===================== BRANDED FOOTER ===================== -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    role="presentation"
    background="https://adinnoutdoors.com/images/adinnFooterbackground.svg"
    style="
        width:100%;
        background-color:#0a0a0a;
        background-image:url('https://adinnoutdoors.com/images/adinnFooterbackground.svg');
        background-size:cover;
        background-repeat:no-repeat;
        background-position:center center;
    "
>
    <tr>
        <td
            align="center"
            style="
                padding:46px 25px 38px;
            "
        >

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
                style="max-width:1080px;"
            >

                <!-- THANK YOU -->
               <tr>
                    <td align="center" style="padding-bottom:35px;font-size:22px;line-height:1.45;font-weight:500;color:#ffffff;">
                        <img src="https://www.adinnoutdoors.com/images/Foot_ThankYou.png" alt="" style="width:28px;vertical-align:middle;margin-right:6px;border:0;">
                        <span style="color:#E31F25;font-weight:700;">Roadshow campaign request</span>
                        <span style="color:#ffffff;">  — please review the details and proceed with the next action. </span>
                    </td>
                </tr>


                <!-- FOOTER COLUMNS -->
                <tr>
                    <td>

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            role="presentation"
                        >

                            <tr>

                                <!-- COMPANY -->
                                <td
                                    width="33.33%"
                                    valign="top"
                                    style="
                                        width:33.33%;
                                        padding:10px 25px 10px 20px;
                                        color:#ffffff;
                                    "
                                >

                                    <img
                                        src="https://adinnoutdoors.com/images/adinnHeaderlogo.svg"
                                        alt="Adinn Roadshow"
                                        height="40"
                                        style="
                                            height:40px;
                                            width:auto;
                                            display:block;
                                            border:0;
                                            outline:none;
                                        "
                                    >

                                    <!-- SOCIAL -->
                                    <table
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        role="presentation"
                                        style="margin-top:18px;"
                                    >
                                        <tr>

                                            <td style="padding-right:6px;">
                                                <a
                                                    href="https://www.instagram.com/adinnroadshows_/"
                                                    target="_blank"
                                                    style="
                                                        text-decoration:none!important;
                                                    "
                                                >
                                                    <img
                                                        src="https://www.adinnoutdoors.com/images/Foot_Insta.png"
                                                        alt="Instagram"
                                                        height="34"
                                                        style="
                                                            height:34px;
                                                            display:block;
                                                            border:0;
                                                        "
                                                    >
                                                </a>
                                            </td>

                                            <td style="padding-right:6px;">
                                                <a
                                                    href="https://www.facebook.com/adinnroadshow"
                                                    target="_blank"
                                                    style="
                                                        text-decoration:none!important;
                                                    "
                                                >
                                                    <img
                                                        src="https://www.adinnoutdoors.com/images/Foot_FB.png"
                                                        alt="Facebook"
                                                        height="34"
                                                        style="
                                                            height:34px;
                                                            display:block;
                                                            border:0;
                                                        "
                                                    >
                                                </a>
                                            </td>

                                            <td>
                                                <a
                                                    href="https://www.linkedin.com/company/adinn-roadshows/"
                                                    target="_blank"
                                                    style="
                                                        text-decoration:none!important;
                                                    "
                                                >
                                                    <img
                                                        src="https://www.adinnoutdoors.com/images/Foot_LinkedIn.png"
                                                        alt="LinkedIn"
                                                        height="34"
                                                        style="
                                                            height:34px;
                                                            display:block;
                                                            border:0;
                                                        "
                                                    >
                                                </a>
                                            </td>

                                        </tr>
                                    </table>

 <!-- PHONE -->
                                    <div
                                        style="
                                            margin-top:18px;
                                            font-size:14px;
                                            line-height:1.8;
                                        "
                                    >

                                        <a
                                            href="tel:+917339509090"
                                            style="
                                                color:#ffffff!important;
                                                text-decoration:none!important;
                                                font-weight:400;
                                            "
                                        >
                                            +91 73395 09090
                                        </a>

                                        <br>

                                        <a
                                            href="tel:+919626907861"
                                            style="
                                                color:#ffffff!important;
                                                text-decoration:none!important;
                                                font-weight:400;
                                            "
                                        >
                                            +91  96269 07861
                                        </a>

                                    </div>


                                    <!-- EMAIL -->
                                    <div
                                        style="
                                            margin-top:4px;
                                            font-size:14px;
                                            line-height:1.7;
                                        "
                                    >

                                        <a
                                            href="mailto:roadshowsales@adinn.co.in"
                                            style="
                                                color:#ffffff!important;
                                                text-decoration:none!important;
                                            "
                                        >
                                            roadshowsales@adinn.co.in
                                        </a>

                                    </div>

                                </td>


                                <!-- SERVICES -->
                                <td
                                    width="33.33%"
                                    valign="top"
                                    style="
                                        width:33.33%;
                                        padding:10px 25px;
                                        color:#ffffff;
                                        font-size:14px;
                                        line-height:1.8;
                                    "
                                >

                                    <div
                                        style="
                                            font-weight:700;
                                            font-size:15px;
                                            margin-bottom:8px;
                                            color:#ffffff;
                                        "
                                    >
                                        Services
                                    </div>

                                    <div style="color:#ffffff;">LED Screen Vehicle</div>
                                    <div style="color:#ffffff;">L-Type LED Vehicle</div>
                                    <div style="color:#ffffff;">3-Side LED Truck</div>
                                    <div style="color:#ffffff;">Customize Fabrication Vehicle</div>
                                    <div style="color:#ffffff;">OOH Media</div>
                                    <div style="color:#ffffff;">Events &amp; Activations</div>
                                    <div style="color:#ffffff;">Digital Marketing</div>

                                </td>


                                <!-- ADDRESS -->
                                <td
                                    width="33.33%"
                                    valign="top"
                                    style="
                                        width:33.33%;
                                        padding:10px 20px 10px 25px;
                                        color:#ffffff;
                                        font-size:13px;
                                        line-height:1.65;
                                    "
                                >

                                    <div
                                        style="
                                            font-weight:700;
                                            font-size:15px;
                                            margin-bottom:8px;
                                            color:#ffffff;
                                        "
                                    >
                                        Address
                                    </div>


                                    <!-- MADURAI -->
                                    <a
                                        href="https://www.google.com/maps/search/?api=1&query=29+1st+Cross+Street+Vanamamalai+Nagar+Bypass+Road+Madurai+Tamil+Nadu+625010"
                                        target="_blank"
                                        style="
                                            color:#ffffff!important;
                                            text-decoration:none!important;
                                            font-weight:400;
                                        "
                                    >
                                        29, 1st Cross Street, Vanamamalai Nagar, By-pass Road,
                                        <br>
                                        <strong
                                            style="
                                                color:#ffffff!important;
                                                text-decoration:none!important;
                                            "
                                        >
                                            Madurai - 625010.
                                        </strong>
                                    </a>


                                    <br><br>


                                    <!-- CHENNAI -->
                                    <a
                                        href="https://www.google.com/maps/search/?api=1&query=19%2F43+MG+Chakrapani+Street+Sathya+Garden+Saligramam+Chennai+600092"
                                        target="_blank"
                                        style="
                                            color:#ffffff!important;
                                            text-decoration:none!important;
                                            font-weight:400;
                                        "
                                    >
                                        No. 19/43, MG Chakrapani Street, Sathya Garden, Saligramam,
                                        <br>
                                        <strong
                                            style="
                                                color:#ffffff!important;
                                                text-decoration:none!important;
                                            "
                                        >
                                            Chennai - 600092.
                                        </strong>
                                    </a>


                                    <br><br>


                                    <!-- BANGALORE -->
                                    <a
                                        href="https://www.google.com/maps/search/?api=1&query=407%2F8+4th+Cross+Jayanagar+7th+Block+Bangalore+560070"
                                        target="_blank"
                                        style="
                                            color:#ffffff!important;
                                            text-decoration:none!important;
                                            font-weight:400;
                                        "
                                    >
                                        No. 407/8, 4th Cross, Jayanagar 7th Block,
                                        Opp-Saraswat Cooperative Bank,
                                        <br>
                                        <strong
                                            style="
                                                color:#ffffff!important;
                                                text-decoration:none!important;
                                            "
                                        >
                                            Bangalore - 560070.
                                        </strong>
                                    </a>

                                </td>

                            </tr>

                        </table>

                    </td>
                </tr>


                <!-- COPYRIGHT -->
                <tr>
                    <td
                        align="center"
                        style="
                            padding-top:28px;
                            font-size:12px;
                            color:#d0d0d0;
                        "
                    >
                        Copyright &copy;
                        <?= date('Y') ?>
                        Adinn Advertising Services.
                        All Rights Reserved.
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</table>
</td></tr></table>
</body>
</html>
