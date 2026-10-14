<?php
/* Customer campaign request email template. */
if (!function_exists('rsUserEscape')) { function rsUserEscape($v){ return htmlspecialchars((string)($v ?? ''), ENT_QUOTES, 'UTF-8'); } }
if (!function_exists('rsUserMoney')) { function rsUserMoney($v){ return '₹ '.number_format((float)($v ?? 0),2,'.',','); } }
if (!function_exists('rsUserDate')) { function rsUserDate($v){ if(!$v)return '-'; try{$d=new DateTime($v);$d->setTimezone(new DateTimeZone('Asia/Kolkata'));return $d->format('d M Y');}catch(Exception $e){return '-';}} }
if (!function_exists('rsUserDateTime')) { function rsUserDateTime($v){ if(!$v)return '-'; try{$d=new DateTime($v);$d->setTimezone(new DateTimeZone('Asia/Kolkata'));return $d->format('d M Y, h:i A');}catch(Exception $e){return '-';}} }
if (!function_exists('rsUserVehicleName')) { function rsUserVehicleName($v){ if(!empty($v['vehicleName']))return $v['vehicleName']; if(!empty($v['vehicleModel']))return $v['vehicleModel']; if(!empty($v['vehicleType'])&&is_array($v['vehicleType'])&&!empty($v['vehicleType']['name']))return $v['vehicleType']['name']; if(!empty($v['vehicleType'])&&is_string($v['vehicleType']))return $v['vehicleType']; return 'Roadshow Vehicle'; } }
$mailData=is_array($mailData??null)?$mailData:[];
$customer=is_array($customer??null)?$customer:($mailData['customer']??[]);
$vehicles=is_array($vehicles??null)?$vehicles:($mailData['vehicles']??[]);
$pricing=is_array($pricing??null)?$pricing:($mailData['pricing']??[]);
$clientOrderId=$clientOrderId??$mailData['clientOrderId']??$mailData['orderId']??'-';
$createdAt=$createdAt??$mailData['createdAt']??'';
$customerBookingUrl=$customerBookingUrl??'';
$customerName=$customer['name']??'Valued Customer';
$subtotal=(float)($pricing['subtotal']??0); $gstPercentage=(float)($pricing['gstPercentage']??0); $gstAmount=(float)($pricing['gstAmount']??0); $cgstAmount=(float)($pricing['cgstAmount']??0); $sgstAmount=(float)($pricing['sgstAmount']??0); $igstAmount=(float)($pricing['igstAmount']??0); $estimatedTotal=(float)($pricing['estimatedTotal']??0);
/* Amounts come pre-formatted (Indian format, e.g. "1,02,660.00") in the payload as <field>Formatted — printed as-is, no formatting here. */
if (!function_exists('rsUserAmount')) { function rsUserAmount($source, $key){ $value = $source[$key.'Formatted'] ?? $source[$key] ?? '0.00'; return '₹ '.rsUserEscape($value); } }
$logoUrl='https://adinndigital.com/api/roadshows/assets/Roadshow_AdinnLogo.png';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Campaign Request Submitted</title>
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
<div style="font-size:17px;font-weight:700;color:#ffffff;">Hello <?= rsUserEscape($customerName) ?>,</div>
<div style="margin-top:15px;font-size:38px;line-height:1.15;font-weight:800;color:#C0392B;">Campaign Request Submitted</div>
<div style="margin-top:12px;font-size:15px;line-height:1.7;color:#e6e6e6;">Thank you for choosing Adinn Roadshow. Your campaign request has been received successfully. Our team will review the campaign requirements, vehicle availability and pricing and contact you shortly.</div>
</td></tr>

<tr><td style="padding:8px 42px 24px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#151515;border:1px solid #3d3d3d;border-radius:14px;"><tr>
<td width="50%" style="padding:17px;border-right:1px solid #333333;"><div style="font-size:10px;text-transform:uppercase;color:#999999;font-weight:700;letter-spacing:.6px;">Request ID</div><div style="margin-top:7px;font-size:14px;font-weight:700;color:#E31F25;"><?= rsUserEscape($clientOrderId) ?></div></td>
<td width="50%" style="padding:17px;"><div style="font-size:10px;text-transform:uppercase;color:#999999;font-weight:700;letter-spacing:.6px;">Submitted On</div><div style="margin-top:7px;font-size:13px;font-weight:600;color:#ffffff;"><?= rsUserEscape(rsUserDateTime($createdAt)) ?></div></td>
</tr></table>
</td></tr>

<tr><td style="padding:2px 42px 10px;font-size:20px;font-weight:700;color:#ffffff;">Vehicle &amp; Campaign Details</td></tr>
<tr><td style="padding:0 42px 26px;">
<?php foreach($vehicles as $i=>$v): $name=rsUserVehicleName($v); $qty=max((int)($v['quantity']??1),1); $days=(int)($v['totalDays']??0); $line=(float)($v['lineTotal']??$v['totalAmount']??0); ?>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;background:#151515;border:1px solid #3d3d3d;border-radius:14px;">
<tr><td style="padding:15px 18px;border-bottom:1px solid #333333;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td><div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#999999;">Vehicle <?= $i+1 ?></div><div style="margin-top:5px;font-size:15px;font-weight:700;color:#ffffff;"><?= rsUserEscape($name) ?></div></td><td align="right"><div style="font-size:10px;color:#999999;">Quantity</div><div style="margin-top:3px;font-size:13px;font-weight:700;color:#ffffff;"><?= $qty ?></div></td></tr></table></td></tr>
<tr><td style="padding:17px 18px;font-size:12px;line-height:1.8;color:#d2d2d2;">
<strong style="color:#ffffff;">Dates:</strong> <?= rsUserEscape(rsUserDate($v['fromDate']??'')) ?> → <?= rsUserEscape(rsUserDate($v['toDate']??'')) ?><?= $days ? ' · '.$days.' day'.($days===1?'':'s') : '' ?><br>
<strong style="color:#ffffff;">Campaign:</strong> <?= rsUserEscape($v['campaignName']??'-') ?><?= !empty($v['campaignType'])?' · '.rsUserEscape($v['campaignType']):'' ?><br>
<strong style="color:#ffffff;">Location:</strong> <?= rsUserEscape($v['campaignLocation']??'-') ?>
<?php if(!empty($v['needPromoter'])):?><br><strong style="color:#ffffff;">Promoter:</strong> <?= rsUserEscape($v['promoterType']??'') ?><?= !empty($v['promoterQuantity'])?' · Qty '.(int)$v['promoterQuantity']:'' ?><?php endif;?>
<?php if($line>0):?><div style="margin-top:11px;padding-top:11px;border-top:1px solid #333333;text-align:right;font-weight:700;color:#E31F25;">Vehicle Total: <?= rsUserAmount($v, 'lineTotal') ?></div><?php endif;?>
</td></tr></table>
<?php endforeach; ?>
</td></tr>

<tr><td style="padding:2px 42px 10px;font-size:20px;font-weight:700;color:#ffffff;">Pricing Summary</td></tr>
<tr><td style="padding:0 42px 24px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#151515;border:1px solid #3d3d3d;border-radius:14px;"><tr><td style="padding:18px 20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:7px 0;color:#c6c6c6;font-size:12px;">Taxable Amount</td><td align="right" style="font-size:12px;font-weight:700;color:#ffffff;"><?= rsUserAmount($pricing, 'subtotal') ?></td></tr>
<?php if($cgstAmount>0||$sgstAmount>0):?><tr><td style="padding:7px 0;color:#c6c6c6;font-size:12px;">CGST <?= $gstPercentage ? '('.($gstPercentage/2).'%)':'' ?></td><td align="right" style="font-weight:700;font-size:12px;color:#ffffff;"><?= rsUserAmount($pricing, 'cgstAmount') ?></td></tr><tr><td style="padding:7px 0;color:#c6c6c6;font-size:12px;">SGST <?= $gstPercentage ? '('.($gstPercentage/2).'%)':'' ?></td><td align="right" style="font-weight:700;font-size:12px;color:#ffffff;"><?= rsUserAmount($pricing, 'sgstAmount') ?></td></tr>
<?php elseif($igstAmount>0):?><tr><td style="padding:7px 0;color:#c6c6c6;font-size:12px;">IGST <?= $gstPercentage ? '('.$gstPercentage.'%)':'' ?></td><td align="right" style="font-weight:700;font-size:12px;color:#ffffff;"><?= rsUserAmount($pricing, 'igstAmount') ?></td></tr>
<?php elseif($gstAmount>0):?><tr><td style="padding:7px 0;color:#c6c6c6;font-size:12px;">GST <?= $gstPercentage ? '('.$gstPercentage.'%)':'' ?></td><td align="right" style="font-weight:700;font-size:12px;color:#ffffff;"><?= rsUserAmount($pricing, 'gstAmount') ?></td></tr><?php endif;?>
<tr><td colspan="2" style="padding-top:10px;"><div style="border-top:1px solid #3a3a3a;"></div></td></tr>
<tr><td style="padding-top:15px;font-size:14px;font-weight:700;color:#ffffff;">Estimated Total</td><td align="right" style="padding-top:15px;font-size:20px;font-weight:800;color:#E31F25;"><?= rsUserAmount($pricing, 'estimatedTotal') ?></td></tr>
</table></td></tr></table>
</td></tr>

<tr><td style="padding:0 42px 22px;"><div style="padding:14px 16px;border:1px solid #5a4730;background:#241d15;border-radius:10px;font-size:11.5px;line-height:1.7;color:#dfc6a5;"><strong style="color:#ffffff;">Please note:</strong> This is an estimated campaign cost. Final pricing and availability will be confirmed after review.</div></td></tr>
<?php if($customerBookingUrl):?><tr><td align="center" style="padding:2px 42px 26px;"><a href="<?= rsUserEscape($customerBookingUrl) ?>" target="_blank" style="display:inline-block;padding:13px 27px;background:#C0392B;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;border-radius:8px;">View My Booking</a></td></tr><?php endif;?>
<!--<tr><td style="padding:0 42px 18px;text-align:center;font-size:11.5px;line-height:1.7;color:#bdbdbd;">Your complete Booking Summary PDF is attached for vehicle-wise pricing, GST and campaign details.</td></tr>-->
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

            Your complete Booking Summary PDF is attached for
            vehicle-wise pricing, GST and campaign details.

        <?php else: ?>

            Your campaign request has been received successfully.
            The Booking Summary can be reviewed from My Bookings.

        <?php endif; ?>

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
                18px;

            text-align:
                center;

            font-size:
                11.5px;

            line-height:
                1.7;

            color:
                #bdbdbd;
        "
    >
        Your Purchase Order document has been received
        successfully and is attached to this email for reference.
    </td>
</tr>

<?php endif; ?>
<!--/* NEW: OPTIONAL AGENCY PO */-->
    </td>
</tr>
<!--<tr><td style="padding:0 42px 38px;text-align:center;font-size:12px;line-height:1.7;color:#ffffff;">Please keep Request ID <strong style="color:#E31F25;"><?= rsUserEscape($clientOrderId) ?></strong> for future reference.</td></tr>-->
<tr>
    <td
        style="
            padding:0 42px 16px;
            text-align:center;
            font-size:12px;
            line-height:1.7;
            color:#ffffff;
        "
    >
        Please keep Request ID
        <strong style="color:#E31F25;">
            <?= rsUserEscape($clientOrderId) ?>
        </strong>
        for future reference.
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
        This is a system-generated email from Adinn Roadshow.
        Please do not reply directly to this message.
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
                        <span style="color:#ffffff;"> — our team is ready to take it forward.</span>
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
